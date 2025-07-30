import { JobPriority } from '../../classes/JobBoard';
import Game from '../../Game';
import { DestroyerFn } from '../../types';
import { byEcsComponents } from '../assert';
import { EcsSystem } from '../classes/EcsSystem';
import { importExportComponent } from '../components/importExportComponent';
import { inventoryComponent } from '../components/inventoryComponent';
import { locationComponent } from '../components/locationComponent';
import { LogisticsExchangeByMaterial } from './logisticsSystem/LogisticsExchangeByMaterial';
import { LogisticsJob } from './logisticsSystem/LogisticsJob';
import { LogisticsDeal, LogisticsEntity } from './logisticsSystem/types';

async function attachSystemToEntity(
	game: Game,
	exchange: LogisticsExchangeByMaterial,
	trader: LogisticsEntity,
) {
	const updateExchangeForInventoryContents = async () => {
		for (const { material, quantity } of trader.provideMaterialsWhenAbove) {
			const availableOf = trader.inventory.availableOf(material);
			if (availableOf > quantity) {
				const provideQuantity = availableOf - quantity;
				exchange.get(material).updateSupplyDemand(trader, provideQuantity);
			}
		}
		for (const { material, quantity } of trader.requestMaterialsWhenBelow) {
			const availableOf = trader.inventory.availableOf(material);
			if (availableOf < quantity) {
				// Never ask for more than what we can stow
				const requestQuantity = Math.min(
					quantity - availableOf,
					trader.inventory.amountAdditionallyAllocatableTo(material),
				);
				exchange.get(material).updateSupplyDemand(trader, -requestQuantity);
			}
		}
	};

	trader.inventory.$change.on(updateExchangeForInventoryContents);
	updateExchangeForInventoryContents();
}

const JOB_POST_INTERVAL = 10_000;
async function attachSystem(game: Game) {
	const exchange = new LogisticsExchangeByMaterial();

	let lastUpdateTime = 0;
	let timeoutId: DestroyerFn<number> | null = null;

	/**
	 * Finds a deal to be made in any of the {@link LogisticExchange}s, and oosts a job for it on
	 * the global jobboard so that a capable entity can pick it up.
	 *
	 * This function is called in a timeout (triggered from an inventory change somewhere) instead
	 * of an interval, because an interval would prevent the game from ever ending.
	 */
	function postTransportJobs(game: Game) {
		if (timeoutId !== null) {
			// A timer is already set
			return;
		}
		const timeLeft = JOB_POST_INTERVAL - (lastUpdateTime % JOB_POST_INTERVAL);

		timeoutId = game.time.setTimeout(() => {
			lastUpdateTime = game.time.now;
			timeoutId = null;
			exchange.forEach((materialExchange) => {
				let deal: LogisticsDeal | null = null;
				while ((deal = materialExchange.getLargestTransferDeal())) {
					// @TODO update an existing transport job, if it exists and while carry capacity can
					materialExchange.excludeDealFromRecords(deal);
					game.jobs.add(JobPriority.NORMAL, new LogisticsJob(deal));
				}
			});
		}, Math.max(timeLeft, 1));
	}

	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					byEcsComponents([importExportComponent, inventoryComponent, locationComponent]),
				)
				.map((trader) => {
					trader.inventory.$change.on(async () => {
						postTransportJobs(game);
					});
					postTransportJobs(game);

					return attachSystemToEntity(game, exchange, trader);
				}),
		);
	});
}

export const logisticsSystem = new EcsSystem(attachSystem);
