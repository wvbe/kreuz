import { EntityBlackboard } from '@lib';
import Game from '../../Game.ts';
import { JobPosting } from '../../behavior/JobPosting.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { importExportComponent } from '../components/importExportComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';

import { TradeFlowExchangeByMaterial } from './tradeFlowSystem/TradeFlowExchangeByMaterial.ts';
import { TradeFlowDeal, TradeFlowEntity } from './tradeFlowSystem/types.ts';

/**
 * Creates inventory reservations for the supplier and destination inventories, so that a transport
 * agreement can be fulfilled.
 */
function createInventoryReservations(transportJobId: string, deal: TradeFlowDeal) {
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
function createTransportJob(transportJobId: string, deal: TradeFlowDeal) {
	const assignJobToEntity = async (job: JobPosting, { game, entity: worker }: EntityBlackboard) => {
		// Jobs are designed to have vacancies, that are taken and restored when the job finishes.
		// For transport jobs however, its not useful to open up a vacancy again when the transport
		// is done. Therefore, remove the job altogether.
		game.jobs.remove(job);

		await worker.$status.set(`Going to ${deal.supplier} for a hauling job`);
		await worker.walkToTile(game.terrain.getTileEqualToLocation(deal.supplier.$$location.get()));

		await worker.$status.set(`Transferring cargo`);
		deal.supplier.inventory.cancelReservation(transportJobId);
		await deal.supplier.inventory.change(deal.material, -deal.quantity);
		await worker.inventory.change(deal.material, deal.quantity);

		await worker.$status.set(`Delivering cargo to ${deal.destination}`);
		await worker.walkToTile(game.terrain.getTileEqualToLocation(deal.destination.$$location.get()));

		await worker.$status.set(`Transferring cargo`);
		await worker.inventory.change(deal.material, -deal.quantity);
		deal.destination.inventory.cancelReservation(transportJobId);
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
	exchange: TradeFlowExchangeByMaterial,
	trader: TradeFlowEntity,
) {
	trader.inventory.$change.on(async () => {
		for (const { material, quantity } of trader.sellMaterialsWhenAbove) {
			if (trader.inventory.availableOf(material) > quantity) {
				exchange.get(material).updateSupplyDemand(trader, quantity);
			}
		}
		for (const { material, quantity } of trader.buyMaterialsWhenBelow) {
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
	const exchange = new TradeFlowExchangeByMaterial();

	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is TradeFlowEntity =>
						importExportComponent.test(entity) &&
						inventoryComponent.test(entity) &&
						locationComponent.test(entity),
				)
				.map((person) => attachSystemToEntity(game, exchange, person)),
		);
	});

	let identifier = 0;
	game.time.setInterval(() => {
		exchange.forEach((materialExchange) => {
			let deal: TradeFlowDeal | null = null;
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
	}, 10_000);
}

export const tradeFlowSystem = new EcsSystem([], attachSystem);
