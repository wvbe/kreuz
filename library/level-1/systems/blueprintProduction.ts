import { FactoryBuildingEntity } from '@lib/core';
import { Blueprint } from '../inventory/Blueprint.ts';
import { blue } from 'https://deno.land/std@0.106.0/fmt/colors.ts';

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

function canStartNewBlueprintCycle(factory: FactoryBuildingEntity, blueprint: Blueprint) {
	if (!blueprint.hasAllIngredients(factory.inventory)) {
		// Not all necessary ingredients are in inventory, so cannot start.
		return false;
	}

	if (!factory.inventory.isEverythingAllocatable(blueprint.products)) {
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

function stopBlueprintCycle(factory: FactoryBuildingEntity) {
	if (isBlueprintCycleBusy(factory)) {
		factory.inventory.cancelReservation(factory);
	}
	factory.$$progress.set(0);
	factory.$$progress.setDelta(0);
	void factory.$status.set('Idle…');
}

export function attachSystem(factory: FactoryBuildingEntity) {
	let ignoreInventoryChanges = false;

	function startNewBlueprintCycle(factory: FactoryBuildingEntity, blueprint: Blueprint) {
		if (isBlueprintCycleBusy(factory)) {
			// This might happen when a healthy blueprint cycle restarts; its delta never resets
			// to 0, ie.it is always busy
			factory.inventory.cancelReservation(factory);
		}
		const delta = getDelta(blueprint, factory.$workers.length);

		ignoreInventoryChanges = true;
		void factory.inventory
			.changeMultiple(
				blueprint.ingredients.map(({ material, quantity }) => ({ material, quantity: -quantity })),
			)
			.then(() => {
				ignoreInventoryChanges = false;
			});
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
			return;
		}
		startNewBlueprintCycle(factory, blueprint);
	});

	factory.$workers.$change.on(() => {
		const blueprint = factory.$blueprint.get();
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

			ignoreInventoryChanges = true;
			void factory.inventory.changeMultiple(blueprint.products).then(() => {
				ignoreInventoryChanges = false;
			});
			if (!canStartNewBlueprintCycle(factory, blueprint)) {
				stopBlueprintCycle(factory);
			} else {
				startNewBlueprintCycle(factory, blueprint);
			}
		},
		true,
	);
}
