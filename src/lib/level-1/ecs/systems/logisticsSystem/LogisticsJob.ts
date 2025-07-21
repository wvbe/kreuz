import { JobPosting } from '../../../classes/JobPosting';
import Game from '../../../Game';
import { assertEcsComponents, hasEcsComponents } from '../../assert';
import { eventLogComponent } from '../../components/eventLogComponent';
import { healthComponent } from '../../components/healthComponent';
import { inventoryComponent } from '../../components/inventoryComponent';
import { locationComponent } from '../../components/locationComponent';
import { pathingComponent } from '../../components/pathingComponent';
import { EcsEntity } from '../../types';
import { LogisticsDeal } from './types';

export class LogisticsJob extends JobPosting {
	private inventoryReservationId: string;
	private deal: LogisticsDeal;

	constructor(deal: LogisticsDeal) {
		super({
			label: `Transport ${deal.material} for ${deal.destination}`,
			vacancies: 1,
			restoreVacancyWhenDone: false,
		});
		this.inventoryReservationId = `transport-job-${deal.supplier.id}-${
			deal.destination.id
		}-${Math.floor(Math.random() * 1000000)}`;
		this.deal = deal;
	}

	async onPost(_game: Game) {
		// As soon as the job is created (not taken), the supplier and destination inventories
		// are reserved for their parts of the deal.
		this.deal.supplier.inventory.makeReservation(this.inventoryReservationId, [
			{
				material: this.deal.material,
				quantity: -this.deal.quantity,
			},
		]);

		this.deal.destination.inventory.makeReservation(this.inventoryReservationId, [
			{
				material: this.deal.material,
				quantity: this.deal.quantity,
			},
		]);
	}

	async onAssign(game: Game, worker: EcsEntity) {
		assertEcsComponents(
			worker,
			[healthComponent, pathingComponent, locationComponent, inventoryComponent],
			[eventLogComponent],
		);
		if (worker.health.get() <= 0) {
			throw new Error('Dead people cannot haul cargo');
		}

		// Jobs are designed to have vacancies, that are taken and restored when the job finishes.
		// For transport jobs however, its not useful to open up a vacancy again when the transport
		// is done. Therefore, remove the job altogether.
		game.jobs.removeGlobal(this);

		await worker.events?.add(`Going to ${this.deal.supplier} for a hauling job`);

		const supplier = game.terrain.getTileEqualToLocation(this.deal.supplier.location.get());
		if (!supplier) {
			throw new Error(`Deal destination lives on a detached coordinate`);
		}

		await worker.walkToTile(game, supplier);
		if (worker.health.get() <= 0) {
			// Worker died to retrieve the cargo. There is now an inventory reservation that will
			// never be fulfilled.
			// @TODO release inventory reservations
			return;
		}

		await worker.events?.add(
			`Loading ${this.deal.quantity} of ${this.deal.material} from ${this.deal.supplier} for transport to ${this.deal.destination}`,
		);
		await this.deal.supplier.events?.add(
			`Giving ${this.deal.quantity} of ${this.deal.material} to ${worker} for transport to ${this.deal.destination}`,
		);

		this.deal.supplier.inventory.clearReservation(this.inventoryReservationId);
		await this.deal.supplier.inventory.change(this.deal.material, -this.deal.quantity);

		// It takes a second to transfer cargo
		await game.time.wait(1_000 * (this.deal.quantity / this.deal.material.stack));

		// Skip emitting this event, because (due to the reservation made) nothing in the available
		// materials changes.
		// - This avoids a bug where the entity might snack on a material bfore it is reserved
		// - This introduces a bug where the UI might not updat
		// @TODO
		await worker.inventory.change(this.deal.material, this.deal.quantity, true);
		worker.inventory.makeReservation('transport-job', [
			// Make an outgoing reservation for the cargo
			// It would be a shame is somebody... ate the cargo
			{ material: this.deal.material, quantity: -this.deal.quantity },
		]);

		await worker.events?.add(`Delivering cargo to ${this.deal.destination}`);

		const destination = game.terrain.getTileEqualToLocation(
			this.deal.destination.location.get(),
		);
		if (!destination) {
			throw new Error(`Deal destination lives on a detached coordinate`);
		}
		await worker.walkToTile(game, destination);

		if (worker.health.get() <= 0) {
			// Worker died on the way to deliver the cargo.
			// @TODO Retrieve the cargo from their cold dead hands and deliver it?
			return;
		}

		await worker.events?.add(`Unloading cargo to ${this.deal.destination}`);
		this.deal.destination.events?.add(
			`Received ${this.deal.quantity} of ${this.deal.material} from ${this.deal.supplier} transported by ${worker}`,
		);
		worker.inventory.clearReservation('transport-job');
		// Skip emitting this event, because (due to the reservation made) nothing in the available
		// materials changes.
		// - This avoids a bug where the entity might snack on a material bfore it is reserved
		// - This introduces a bug where the UI might not updat
		// @TODO
		await worker.inventory.change(this.deal.material, -this.deal.quantity, true);

		// It takes a second to transfer cargo
		await game.time.wait(1_000 * (this.deal.quantity / this.deal.material.stack));

		this.deal.destination.inventory.clearReservation(this.inventoryReservationId);
		await this.deal.destination.inventory.change(this.deal.material, this.deal.quantity);
	}

	onScore(_game: Game, worker: EcsEntity): number {
		if (
			!hasEcsComponents(worker, [
				healthComponent,
				pathingComponent,
				locationComponent,
				inventoryComponent,
			])
		) {
			return 0;
		}
		if (worker.health.get() <= 0) {
			// Dead people cannot haul cargo
			return 0;
		}
		if (!worker.inventory.isAdditionallyAllocatableTo(this.deal.material, this.deal.quantity)) {
			// If not enough inventory space, never take the job
			return 0;
		}

		let desirability = 1;
		const maximumDistanceWillingToTravel = 20,
			distanceToJob = worker.euclideanDistanceTo(this.deal.supplier.location.get()),
			// 1 = very close job, 0 = infinitely far
			distanceMultiplier = Math.max(
				0,
				(maximumDistanceWillingToTravel - distanceToJob) / maximumDistanceWillingToTravel,
			);

		desirability *= distanceMultiplier;

		// Give a small boost so that, all other things being equal, a transport job is preferred over
		// a production job
		desirability *= 1.1;

		return desirability;
	}
}
