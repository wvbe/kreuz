import Game from '../../Game.ts';
import { JobVacancy } from '../../behavior/JobVacancy.ts';
import { Blueprint } from '../../inventory/Blueprint.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { pathingComponent } from '../components/pathingComponent.ts';
import { walkToTile } from '../components/pathingComponent.ts';
import { productionComponent } from '../components/productionComponent.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { EcsEntity } from '../types.ts';

type WorkerEntity = EcsEntity<
	typeof statusComponent | typeof locationComponent | typeof pathingComponent
>;

type ProductionEntity = EcsEntity<
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
function canStartNewBlueprintCycle(factory: ProductionEntity, blueprint: Blueprint) {
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
function isBlueprintCycleBusy(factory: ProductionEntity): boolean {
	const isBusy = !!(factory.$blueprint.get() && factory.$$progress.delta > 0);
	return isBusy;
}

async function assignWorkerToFactory(game: Game, worker: WorkerEntity, factory: ProductionEntity) {
	await worker.$status.set(`Going to ${factory} for work`);
	const tile = game.terrain.getTileEqualToLocation(factory.$$location.get());
	await walkToTile(worker, tile);

	await factory.$workers.add(worker);

	await worker.$status.set(`Working in ${factory}`);

	// Finish job when the worker is removed from the worker list. factory happens
	// when the factory is not productive for a while..
	await new Promise<void>((resolve) => {
		const unlisten = factory.$workers.$remove.on((removed) => {
			if (!removed.includes(worker)) {
				return;
			}
			unlisten();
			resolve();
		});
	});

	await worker.$status.set(null);
}

async function attachSystemToEntity(game: Game, factory: ProductionEntity) {
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

	function stopBlueprintCycle(factory: ProductionEntity, skipClearReservation = false) {
		if (!skipClearReservation && isBlueprintCycleBusy(factory)) {
			hasReservation = false;
			factory.inventory.cancelReservation(factory);
		}
		factory.$$progress.set(0);
		factory.$$progress.setDelta(0);
		void factory.$status.set('Idle…');

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

	function startNewBlueprintCycle(factory: ProductionEntity, blueprint: Blueprint) {
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
		void factory.$status.set('Working…');
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
			factory.inventory.cancelReservation(factory);
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
	function createWorkerJobVacancy(blueprint: Blueprint | null) {
		if (!blueprint || blueprint.options.workersRequired < 1) {
			return;
		}
		const vacancy = new JobVacancy(
			(blackboard) => assignWorkerToFactory(game, blackboard.entity, factory),
			{
				vacancies: factory.maxWorkers,
				employer: factory,
				score: ({ entity }) => {
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
		game.jobs.add(vacancy);
		factory.$blueprint.once(() => game.jobs.remove(vacancy));
	}
	factory.$blueprint.on(createWorkerJobVacancy);
	createWorkerJobVacancy(factory.$blueprint.get());

	// factory.$detach.once(async () => {
	// 	await factory.$$progress.detach();
	// });

	await factory.$$progress.attach(game);
	// factory.$blueprint.set(factory.options.blueprint);
}

async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is ProductionEntity =>
						productionComponent.test(entity) &&
						statusComponent.test(entity) &&
						inventoryComponent.test(entity) &&
						locationComponent.test(entity),
				)
				.map((person) => attachSystemToEntity(game, person)),
		);
	});
}

export const blueprintSystem = new EcsSystem(
	[productionComponent, statusComponent, locationComponent, inventoryComponent, pathingComponent],
	attachSystem,
);
