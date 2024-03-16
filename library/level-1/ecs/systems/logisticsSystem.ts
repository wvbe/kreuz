import Game from '../../Game.ts';
import { JobPosting } from '../components/behaviorComponent/JobPosting.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { importExportComponent } from '../components/importExportComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';

import { LogisticsExchangeByMaterial } from './logisticsSystem/LogisticsExchangeByMaterial.ts';
import { LogisticsDeal, LogisticsEntity } from './logisticsSystem/types.ts';
import { EntityBlackboard } from '../components/behaviorComponent/types.ts';
import { DestroyerFn } from '../../types.ts';

/**
 * Creates inventory reservations for the supplier and destination inventories, so that a transport
 * agreement can be fulfilled.
 */
function createInventoryReservations(transportJobId: string, deal: LogisticsDeal) {
	// As soon as the job is created (not taken), the supplier and destination inventories are reserved
	// for their parts of the deal.
	deal.supplier.inventory.makeReservation(transportJobId, [
		{
			material: deal.material,
			quantity: -deal.quantity,
		},
	]);

	deal.destination.inventory.makeReservation(transportJobId, [
		{
			material: deal.material,
			quantity: deal.quantity,
		},
	]);
}
/**
 * Creates a job that represents a transport job. Same as production jobs, transport jobs can be
 * attractive to certain persons, or not.
 */
function createTransportJob(transportJobId: string, deal: LogisticsDeal) {
	const assignJobToEntity = async (job: JobPosting, { game, entity: worker }: EntityBlackboard) => {
		// Jobs are designed to have vacancies, that are taken and restored when the job finishes.
		// For transport jobs however, its not useful to open up a vacancy again when the transport
		// is done. Therefore, remove the job altogether.
		game.jobs.remove(job);

		await worker.$status.set(`Going to ${deal.supplier} for a hauling job`);
		await worker.walkToTile(game.terrain.getTileEqualToLocation(deal.supplier.$$location.get()));

		await worker.$status.set(`Transferring cargo`);
		deal.supplier.inventory.clearReservation(transportJobId);
		await deal.supplier.inventory.change(deal.material, -deal.quantity);
		await worker.inventory.change(deal.material, deal.quantity);

		await worker.$status.set(`Delivering cargo to ${deal.destination}`);
		await worker.walkToTile(game.terrain.getTileEqualToLocation(deal.destination.$$location.get()));

		await worker.$status.set(`Transferring cargo`);
		await worker.inventory.change(deal.material, -deal.quantity);
		deal.destination.inventory.clearReservation(transportJobId);
		await deal.destination.inventory.change(deal.material, deal.quantity);

		await worker.$status.set(null);
	};

	const scoreJobDesirability = ({ entity }: EntityBlackboard) => {
		if (!entity.inventory.isAdditionallyAllocatableTo(deal.material, deal.quantity)) {
			// If not enough inventory space, never take the job
			return 0;
		}

		let desirability = 1;
		const maximumDistanceWillingToTravel = 20,
			distanceToJob = entity.$$location.get().euclideanDistanceTo(deal.supplier.$$location.get()),
			// 1 = very close job, 0 = infinitely far
			distanceMultiplier = Math.max(
				0,
				(maximumDistanceWillingToTravel - distanceToJob) / maximumDistanceWillingToTravel,
			);

		desirability *= distanceMultiplier;

		return desirability;
	};

	return new JobPosting(assignJobToEntity, {
		vacancies: 1,
		employer: deal.destination,
		score: scoreJobDesirability,
	});
}

async function attachSystemToEntity(
	game: Game,
	exchange: LogisticsExchangeByMaterial,
	trader: LogisticsEntity,
) {
	trader.inventory.$change.on(async () => {
		for (const { material, quantity } of trader.provideMaterialsWhenAbove) {
			if (trader.inventory.availableOf(material) > quantity) {
				exchange.get(material).updateSupplyDemand(trader, quantity);
			}
		}
		for (const { material, quantity } of trader.requestMaterialsWhenBelow) {
			if (trader.inventory.availableOf(material) < quantity) {
				// Never ask for more than what we can stow
				const requestQuantity = Math.min(
					quantity,
					trader.inventory.amountAdditionallyAllocatableTo(material),
				);
				exchange.get(material).updateSupplyDemand(trader, -requestQuantity);
			}
		}
	});
}

async function attachSystem(game: Game) {
	const exchange = new LogisticsExchangeByMaterial();

	let identifier = 0;
	let lastUpdateTime = 0;
	let timeoutId: DestroyerFn<number> | null = null;

	function postTransportJobs() {
		exchange.forEach((materialExchange) => {
			let deal: LogisticsDeal | null = null;
			while ((deal = materialExchange.getLargestTransferDeal())) {
				const transportJobId = `transport-job-${identifier++}`;
				// console.log(
				// 	[
				// 		transportJobId,
				// 		deal.supplier,
				// 		`${deal.quantity}x ${deal.material}`,
				// 		deal.destination,
				// 	].join('\t'),
				// );
				materialExchange.excludeDealFromRecords(deal);
				createInventoryReservations(transportJobId, deal);
				const job = createTransportJob(transportJobId, deal);
				game.jobs.add(job);
			}
		});
	}

	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is LogisticsEntity =>
						importExportComponent.test(entity) &&
						inventoryComponent.test(entity) &&
						locationComponent.test(entity),
				)
				.map((trader) => {
					trader.inventory.$change.on(async () => {
						if (timeoutId !== null) {
							// A timer is already set
							return;
						}
						const timeLeft = lastUpdateTime % 10_000;
						timeoutId = game.time.setTimeout(() => {
							postTransportJobs();
							lastUpdateTime = game.time.now;
							timeoutId = null;
						}, Math.max(timeLeft, 1));
					});

					return attachSystemToEntity(game, exchange, trader);
				}),
		);
	});

	game.time.setInterval(() => {}, 10_000);
}

export const logisticsSystem = new EcsSystem([], attachSystem);
