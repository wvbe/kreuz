import { FactoryBuildingEntity } from '@lib/core';
import { Blueprint } from '../inventory/Blueprint.ts';
import { EntityI } from '@lib';
import Game from '../Game.ts';

/**
 * Checks if an entity can work on a blueprint.
 * @param entity - The entity to check.
 * @returns Returns true if the entity can work on a blueprint, false otherwise.
 */
export function canEntityWorkOnBlueprint(entity: EntityI) {
	return entity.type === 'person';
}

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
function canStartNewBlueprintCycle(factory: FactoryBuildingEntity, blueprint: Blueprint) {
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
function isBlueprintCycleBusy(factory: FactoryBuildingEntity): boolean {
	const isBusy = !!(factory.$blueprint.get() && factory.$$progress.delta > 0);
	return isBusy;
}

export function attachSystem(game: Game, factory: FactoryBuildingEntity) {
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

	function stopBlueprintCycle(factory: FactoryBuildingEntity, skipClearReservation = false) {
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
				console.log('Remove all the workers');
				factory.$workers.removeAll();
			}
		}, 1000);
	}

	function startNewBlueprintCycle(factory: FactoryBuildingEntity, blueprint: Blueprint) {
		if (!canAllocateProducts()) {
			throw new Error('New cycle shouldna been started, but it was');
		}
		// if (isBlueprintCycleBusy(factory)) {
		// 	// This might happen when a healthy blueprint cycle restarts; its delta never resets
		// 	// to 0, ie.it is always busy
		// hasReservation = false;
		// 	factory.inventory.cancelReservation(factory);
		// }
		const delta = getDelta(blueprint, factory.$workers.length);

		ignoreInventoryChanges = true;
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
}
