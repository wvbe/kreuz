import { ProductionJob } from '../../../level-2/commands/ProductionJob';
import Game from '../../Game';
import { type Material } from '../../inventory/Material';
import { byEcsComponents } from '../assert';
import { EcsSystem } from '../classes/EcsSystem';
import { eventLogComponent } from '../components/eventLogComponent';
import { inventoryComponent } from '../components/inventoryComponent';
import { locationComponent } from '../components/locationComponent';
import { productionComponent } from '../components/productionComponent';
import { Blueprint } from '../components/productionComponent/Blueprint';
import { EcsEntity } from '../types';

/**
 * The minimal entity definition that can function as a factory building in this system.
 *
 * Note that {@link factoryArchetype} is a superset definition of a factory building.
 */
type ProductionSystemFactoryEntity = EcsEntity<
	| typeof productionComponent
	| typeof eventLogComponent
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
	const isBusy = !!(factory.blueprint.get() && factory.$$progress.delta > 0);
	return isBusy;
}

async function attachSystemToEntity(game: Game, factory: ProductionSystemFactoryEntity) {
	let ignoreInventoryChanges = false;
	let hasReservation = false;

	function canAllocateProducts() {
		const blueprint = factory.blueprint.get();
		if (!blueprint) {
			return false;
		}
		return (
			hasReservation ||
			factory.inventory.isEverythingAdditionallyAllocatable(blueprint.products)
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
		// void factory.events.add('Idle…');

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
				blueprint.ingredients.map(({ material, quantity }) => ({
					material,
					quantity: -quantity,
				})),
			)
			.then(() => {
				ignoreInventoryChanges = false;
			});
		hasReservation = true;
		factory.inventory.makeReservation(factory, blueprint.products);
		factory.$$progress.set(0);
		factory.$$progress.setDelta(delta);
		// void factory.events.add('Working…');
	}

	factory.blueprint.on((blueprint) => {
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
		const blueprint = factory.blueprint.get();
		if (!blueprint || !canStartNewBlueprintCycle(factory, blueprint)) {
			stopBlueprintCycle(factory);
		} else {
			startNewBlueprintCycle(factory, blueprint);
		}
	});

	factory.$workers.$change.on(() => {
		const blueprint = factory.blueprint.get();
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
		async () => {
			const blueprint = factory.blueprint.get();
			if (!blueprint) {
				// Indicative of a bug somewhere!
				throw new Error('Blueprint is somehow unset while the cycle is completing');
			}

			await factory.onComplete?.();

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

		const jobPosting = new ProductionJob(factory);
		game.jobs.addGlobal(jobPosting);
		factory.blueprint.once(() => game.jobs.removeGlobal(jobPosting));
	}
	factory.blueprint.on(createWorkerJobPosting.bind(undefined, game));
	createWorkerJobPosting(game, factory.blueprint.get());

	await factory.$$progress.attach(game);
}

async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					byEcsComponents([
						productionComponent,
						eventLogComponent,
						locationComponent,
						inventoryComponent,
					]),
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
export const productionSystem = new EcsSystem(attachSystem);
