import Game from '../../Game.ts';
import { type Material } from '../../inventory/Material.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { JobPosting } from '../components/behaviorComponent/JobPosting.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { pathingComponent } from '../components/pathingComponent.ts';
import {
	ProductionComponentWorkerEntity,
	productionComponent,
} from '../components/productionComponent.ts';
import { Blueprint } from '../components/productionComponent/Blueprint.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { EcsEntity } from '../types.ts';

/**
 * The minimal entity definition that can function as a factory building in this system.
 *
 * Note that {@link factoryArchetype} is a superset definition of a factory building.
 */
type ProductionSystemFactoryEntity = EcsEntity<
	| typeof productionComponent
	| typeof statusComponent
	| typeof locationComponent
	| typeof inventoryComponent
>;

/**
 * Calculates the delta value for a given blueprint and worker amount.
 * The delta value represents the speed at which the blueprint should be processed.
 *
 * @param blueprint - The blueprint for which to calculate the delta.
 * @param workerAmount - The number of workers available for the blueprint.
 * @returns The calculated delta value.
 */
function getDelta(blueprint: Blueprint, workerAmount: number) {
	let delta = 1 / blueprint.options.fullTimeEquivalent;

	if (blueprint.options.workersRequired <= 0) {
		// If the blueprint does not require workers, process at 1x full speed
		return delta;
	}

	// Otherwise, the delta is in proportion the amount of workers required
	delta *= workerAmount / blueprint.options.workersRequired;

	// If ther are less workers than required, the delta is extra slow
	if (workerAmount < blueprint.options.workersRequired) {
		delta *= 0.3;
	}

	return delta;
}

/**
 * Checks if a new blueprint cycle can be started in the given factory building entity.
 * @param factory - The factory building entity.
 * @param blueprint - The blueprint to be produced.
 * @returns A boolean indicating whether a new blueprint cycle can be started.
 */
function canStartNewBlueprintCycle(factory: ProductionSystemFactoryEntity, blueprint: Blueprint) {
	if (!blueprint.hasAllIngredients(factory.inventory)) {
		// Not all necessary ingredients are in inventory, so cannot start.
		return false;
	}

	if (!factory.inventory.isEverythingAdditionallyAllocatable(blueprint.products)) {
		// The products cannot be stowed, so cannot start.
		return false;
	}

	const delta = getDelta(blueprint, factory.$workers.length);
	if (delta <= 0) {
		// For some reason there's not enough to make progress, so cannot start.
		return false;
	}
	return true;
}

/**
 * Tells wether or not a factory is already working on a blueprint production cycle, or not.
 */
function isBlueprintCycleBusy(factory: ProductionSystemFactoryEntity): boolean {
	const isBusy = !!(factory.$blueprint.get() && factory.$$progress.delta > 0);
	return isBusy;
}

async function assignWorkerToFactory(
	game: Game,
	worker: ProductionComponentWorkerEntity,
	factory: ProductionSystemFactoryEntity,
) {
	if (worker.$health.get() <= 0) {
		throw new Error('Dead people cannot work');
	}
	await worker.$status.push(`Going to ${factory} for work`);
	const tile = game.terrain.getTileEqualToLocation(factory.$$location.get());
	if (!tile) {
		throw new Error(`Entity "${factory.id}" lives on a detached coordinate`);
	}
	await worker.walkToTile(game, tile);
	if (worker.$health.get() <= 0) {
		// Worker died on the way to the factory :(
		return;
	}

	await factory.$workers.add(worker);

	const destroyWorkerPoorHealthListener = worker.$health.$recalibrate.on(() => {
		if (worker.$health.delta > 0) {
			return;
		}
		factory.$workers.remove(worker);
	});

	// .on instead of .once, because we're manually destroying the listener
	const destroyDeathListener = worker.$death.on(() => {
		factory.$workers.remove(worker);
	});

	// const destroyProductionComplete = factory.$$progress.onBelow(
	// 	0,
	// 	() => {
	// 		factory.$workers.remove(worker);
	// 	},
	// 	true,
	// );

	await worker.$status.push(`Working in ${factory}`);

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

	await worker.$status.pop();
}

async function attachSystemToEntity(game: Game, factory: ProductionSystemFactoryEntity) {
	let ignoreInventoryChanges = false;
	let hasReservation = false;

	function canAllocateProducts() {
		const blueprint = factory.$blueprint.get();
		if (!blueprint) {
			return false;
		}
		return (
			hasReservation || factory.inventory.isEverythingAdditionallyAllocatable(blueprint.products)
		);
	}

	function stopBlueprintCycle(
		factory: ProductionSystemFactoryEntity,
		skipClearReservation = false,
	) {
		if (!skipClearReservation && isBlueprintCycleBusy(factory)) {
			hasReservation = false;
			factory.inventory.clearReservation(factory);
		}
		factory.$$progress.set(0);
		factory.$$progress.setDelta(0);
		void factory.$status.push('Idle…');

		// Workers wait around a little bit to see if theres no more work. After an hour of idleness, they go home.
		if (!factory.$workers.length) {
			return;
		}
		game.time.setTimeout(() => {
			if (!isBlueprintCycleBusy(factory)) {
				factory.$workers.removeAll();
			}
		}, 1000);
	}

	function startNewBlueprintCycle(factory: ProductionSystemFactoryEntity, blueprint: Blueprint) {
		if (!canAllocateProducts()) {
			throw new Error('New cycle shouldna been started, but it was');
		}
		ignoreInventoryChanges = true;
		const delta = getDelta(blueprint, factory.$workers.length);
		void factory.inventory
			.changeMultiple(
				blueprint.ingredients.map(({ material, quantity }) => ({ material, quantity: -quantity })),
			)
			.then(() => {
				ignoreInventoryChanges = false;
			});
		hasReservation = true;
		factory.inventory.makeReservation(factory, blueprint.products);
		factory.$$progress.set(0);
		factory.$$progress.setDelta(delta);
		void factory.$status.push('Working…');
	}

	factory.$blueprint.on((blueprint) => {
		if (!blueprint || !canStartNewBlueprintCycle(factory, blueprint)) {
			stopBlueprintCycle(factory);
		} else {
			startNewBlueprintCycle(factory, blueprint);
		}
	});

	factory.inventory.$change.on(() => {
		if (ignoreInventoryChanges) {
			return;
		}
		if (isBlueprintCycleBusy(factory)) {
			return;
		}
		const blueprint = factory.$blueprint.get();
		if (!blueprint || !canStartNewBlueprintCycle(factory, blueprint)) {
			stopBlueprintCycle(factory);
		} else {
			startNewBlueprintCycle(factory, blueprint);
		}
	});

	factory.$workers.$change.on(() => {
		const blueprint = factory.$blueprint.get();
		if (!canAllocateProducts()) {
			stopBlueprintCycle(factory);
			return;
		}
		if (isBlueprintCycleBusy(factory)) {
			// Cycle is already running, an inventory reservation should already have been made
			const delta = getDelta(blueprint!, factory.$workers.length);
			if (delta > 0) {
				factory.$$progress.setDelta(delta);
			} else {
				stopBlueprintCycle(factory);
			}
			return;
		}

		if (blueprint && canStartNewBlueprintCycle(factory, blueprint)) {
			startNewBlueprintCycle(factory, blueprint);
		}
	});

	factory.$$progress.onAbove(
		1,
		() => {
			const blueprint = factory.$blueprint.get();
			if (!blueprint) {
				// Indicative of a bug somewhere!
				throw new Error('Blueprint is somehow unset while the cycle is completing');
			}

			if (!canAllocateProducts()) {
				stopBlueprintCycle(factory);
				return;
			}
			// All products are allocatable, so the cycle is complete
			ignoreInventoryChanges = true;
			hasReservation = false;
			factory.inventory.clearReservation(factory);
			void factory.inventory.changeMultiple(blueprint.products).then(() => {
				ignoreInventoryChanges = false;
			});
			if (!canStartNewBlueprintCycle(factory, blueprint)) {
				stopBlueprintCycle(factory, true);
			} else {
				startNewBlueprintCycle(factory, blueprint);
			}
		},
		true,
	);

	/**
	 * Creates a job vacancy for a worker based on the given blueprint. Entities who are able may pick
	 * up on this vacancy and come work on this blueprint.
	 */
	function createWorkerJobPosting(game: Game, blueprint: Blueprint | null) {
		if (!blueprint || blueprint.options.workersRequired < 1) {
			return;
		}
		const vacancy = new JobPosting(
			(_job, entity) =>
				assignWorkerToFactory(game, entity as ProductionComponentWorkerEntity, factory),
			{
				vacancies: factory.maxWorkers,
				restoreVacancyWhenDone: true,
				employer: factory,
				score: (entity) => {
					if (
						!healthComponent.test(entity) ||
						!wealthComponent.test(entity) ||
						!locationComponent.test(entity) ||
						!statusComponent.test(entity) ||
						!pathingComponent.test(entity)
					) {
						// Entities who are not interested in money, or entities who do not have a location,
						// are never interested in this job.
						return 0;
					}

					if (!entity.$health.get()) {
						// This person is ded
						return 0;
					}

					let desirability = 1;

					const maximumDistanceWillingToTravel = 20,
						distanceToJob = entity.$$location.get().euclideanDistanceTo(factory.$$location.get()),
						// 1 = very close job, 0 = infinitely far
						distanceMultiplier = Math.max(
							0,
							(maximumDistanceWillingToTravel - distanceToJob) / maximumDistanceWillingToTravel,
						);
					desirability *= distanceMultiplier;

					if (
						distanceMultiplier > 0 &&
						(!blueprint.hasAllIngredients(factory.inventory) ||
							!factory.inventory.isEverythingAdditionallyAllocatable(blueprint.products))
					) {
						// Not enough ingredients in inventory to start another production cycle
						// Or not enough space to stow the products
						desirability *= 0.1;
					}

					return desirability;
				},
			},
		);
		game.jobs.addGlobal(vacancy);
		factory.$blueprint.once(() => game.jobs.removeGlobal(vacancy));
	}
	factory.$blueprint.on(createWorkerJobPosting.bind(undefined, game));
	createWorkerJobPosting(game, factory.$blueprint.get());

	await factory.$$progress.attach(game);
}

async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is ProductionSystemFactoryEntity =>
						productionComponent.test(entity) &&
						statusComponent.test(entity) &&
						inventoryComponent.test(entity) &&
						locationComponent.test(entity),
				)
				.map((person) => attachSystemToEntity(game, person)),
		);
	});
}

/**
 * The production system lets factories or other entities with production-related components produce
 * {@link Material}s. A {@link Blueprint} is used as the recipe for this production process.
 *
 * Blueprint ingredients and products are all exchanged within the inventory belonging to the factory
 * entity.
 *
 * The production speed is determined by the amount of worker entities at the factory -- the
 * production speed is linear to the number of workers, unless there are too little workers to
 * satisfy the requirement of a blueprint, in which case the production speed is penalized by 70%.
 *
 * When a production cycle is complete and there is still enough ingredients as well as avaialble space
 * in the inventory, and workers present, a new production cycle starts automatically.
 */
export const productionSystem = new EcsSystem(
	[
		productionComponent,
		statusComponent,
		locationComponent,
		inventoryComponent,
		pathingComponent,
		healthComponent,
	],
	attachSystem,
);
