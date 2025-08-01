import { JobPosting } from '../../core/classes/JobPosting';
import { assertEcsComponents, hasEcsComponents } from '../../core/ecs/assert';
import { eventLogComponent } from '../../core/ecs/components/eventLogComponent';
import { healthComponent } from '../../core/ecs/components/healthComponent';
import { inventoryComponent } from '../../core/ecs/components/inventoryComponent';
import { getTileAtLocation } from '../../core/ecs/components/location/getTileAtLocation';
import { locationComponent } from '../../core/ecs/components/locationComponent';
import { pathingComponent } from '../../core/ecs/components/pathingComponent';
import { productionComponent } from '../../core/ecs/components/productionComponent';
import { wealthComponent } from '../../core/ecs/components/wealthComponent';
import { EcsEntity } from '../../core/ecs/types';
import Game from '../../core/Game';

/**
 * Duplicated somewhere
 */
type ProductionSystemFactoryEntity = EcsEntity<
	| typeof productionComponent
	| typeof eventLogComponent
	| typeof locationComponent
	| typeof inventoryComponent
>;

export class ProductionJob extends JobPosting {
	private factory: ProductionSystemFactoryEntity;
	constructor(factory: ProductionSystemFactoryEntity) {
		super({
			location: factory.location.get(),
			label: `Working for ${factory}`,
			vacancies: factory.maxWorkers,
			restoreVacancyWhenDone: true,
		});
		this.factory = factory;
	}

	onScore(game: Game, worker: EcsEntity): number {
		if (
			!hasEcsComponents(worker, [
				healthComponent,
				wealthComponent,
				locationComponent,
				pathingComponent,
			])
		) {
			// Entities who are not interested in money, or entities who do not have a location,
			// are never interested in this job.
			return 0;
		}

		if (!worker.health.get()) {
			// This person is ded
			return 0;
		}

		let desirability = 1;

		const maximumDistanceWillingToTravel = 20 * game.terrain.sizeMultiplier,
			distanceToJob = worker.euclideanDistanceTo(this.factory.location.get()),
			// 1 = very close job, 0 = infinitely far
			distanceMultiplier = Math.max(
				0,
				(maximumDistanceWillingToTravel - distanceToJob) / maximumDistanceWillingToTravel,
			);
		desirability *= distanceMultiplier;

		const blueprint = this.factory.blueprint.get();
		if (!blueprint) {
			return 0;
		}
		if (
			distanceMultiplier > 0 &&
			(!blueprint.hasAllIngredients(this.factory.inventory) ||
				!this.factory.inventory.isEverythingAdditionallyAllocatable(
					blueprint.products ?? [],
				))
		) {
			// Not enough ingredients in inventory to start another production cycle
			// Or not enough space to stow the products
			desirability *= 0.1;
		}

		return desirability;
	}

	async onPost(game: Game) {
		// assertEcsComponents(this.tile, [locationComponent, pathableComponent, surfaceComponent]);
		// this.marker = mapMarkerArchetype.create({
		// 	location: this.tile.location.get(),
		// 	icon: '⛏️',
		// 	name: 'Excavation site',
		// });
		// await game.entities.add(this.marker);
	}

	async onAssign(game: Game, worker: EcsEntity): Promise<void> {
		assertEcsComponents(worker, [
			healthComponent,
			eventLogComponent,
			locationComponent,
			pathingComponent,
		]);

		if (worker.health.get() <= 0) {
			throw new Error('Dead people cannot work');
		}

		const factory = this.factory;
		await worker.events?.add(`Going to ${factory} for work`);

		const tile = getTileAtLocation(factory.location.get());
		if (!tile) {
			throw new Error(`Entity "${factory.id}" lives on a detached coordinate`);
		}
		await worker.walkToTile(game, tile);
		if (worker.health.get() <= 0) {
			// Worker died on the way to the factory :(
			return;
		}

		await factory.$workers.add(worker);

		const destroyWorkerPoorHealthListener = worker.health.$recalibrate.on(() => {
			if (worker.health.delta > 0) {
				return;
			}
			worker.events?.add(`Poor health, leaving job at ${factory}`);
			factory.$workers.remove(worker);
		});

		// .on instead of .once, because we're manually destroying the listener
		const destroyDeathListener = worker.$death.on(() => {
			factory.$workers.remove(worker);
		});

		await worker.events?.add(`Working in ${factory}`);

		// Finish job when the worker is removed from the worker list. factory happens
		// when the factory is not productive for a while..
		await new Promise<void>((resolve) => {
			const unlisten = factory.$workers.$remove.on((removed) => {
				if (!removed.includes(worker)) {
					return;
				}
				destroyDeathListener();
				destroyWorkerPoorHealthListener();
				// destroyProductionComplete();
				unlisten();
				resolve();
			});
		});
	}
}
