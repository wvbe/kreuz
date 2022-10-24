import { EventedValue } from '../classes/EventedValue.ts';
import { ProgressingNumericValue } from '../classes/ProgressingNumericValue.ts';
import { type FactoryBuildingEntity } from '../entities/entity.building.factory.ts';
import type Game from '../Game.ts';
import { type Blueprint } from '../inventory/Blueprint.ts';
import { type Inventory } from '../inventory/Inventory.ts';
import { Task } from './task.ts';

export class ProductionTask extends Task<[Game, FactoryBuildingEntity]> {
	public readonly $$progress = new ProgressingNumericValue(
		0,
		{ delta: 0 },
		`${this.constructor.name} $$progress`,
	);

	public readonly $$blueprint = new EventedValue<Blueprint | null>(
		null,
		'FactoryBuildingEntity $$blueprint',
	);

	public constructor(blueprint: Blueprint | null) {
		super((game, entity) => {
			this.$interrupt.once(
				this.$$blueprint.on((blueprint) => {
					if (!blueprint) {
						// Cancel a production cycle mid-way
						// @TODO
						return;
					}
					this.attemptStartBlueprint(entity.inventory);
				}),
			);

			this.$interrupt.once(
				this.$$progress.onBetween(1, Infinity, () => {
					const blueprint = this.$$blueprint.get();
					if (!blueprint) {
						// Indicative of a bug somewhere!
						throw new Error('Blueprint is somehow unset while the cycle is completing');
					}
					// When the progress on a blueprint finishes
					// - Transfer product material
					// - Start a new cycle, or stop all blueprint progression
					entity.inventory.changeMultiple(blueprint.products);
					this.$$progress.set(0);
					if (!this.attemptStartBlueprint(entity.inventory)) {
						this.$$progress.setDelta(0);
					}
				}),
			);

			this.$$progress.attach(game);
			this.$interrupt.once(() => this.$$progress.detach());

			this.$interrupt.once(
				entity.inventory.$change.on(() => {
					if (this.#avoidRespondingToOwnInventoryChange) {
						return;
					}
					// @TODO handle the case where the inventory is changed in sucha  way that the
					// blueprint products cannot be placed.
					this.attemptStartBlueprint(entity.inventory);
				}),
			);
			this.attemptStartBlueprint(entity.inventory);
		});

		this.setBlueprint(blueprint);
	}

	public get label() {
		return this.$$blueprint.get()?.name || 'Not working on any blueprint';
	}

	public get blueprint() {
		return this.$$blueprint.get();
	}

	public setBlueprint(blueprint: Blueprint | null) {
		if (this.isBusy()) {
			throw new Error('Cannot change blueprint while buiding is busy');
		}
		// @TODO chagne blueprint to something else, without unsetting it first?
		this.$$blueprint.set(blueprint);
	}

	private isBusy() {
		// To be busy;
		// - There must be a blueprint
		// - And you must have made progress with whatever you're doing
		// - And you must be continuing to make progress
		return this.$$blueprint.get() && this.$$progress.delta > 0 && this.$$progress.get() > 0;
	}

	/**
	 * An inventory change may trigger the job to see if it can start itself -- for example when it
	 * is not busy. The job is not busy when it has just finished one cycle and is about the start
	 * another, which is exactly when the inventory is being updated. However, if we respond to our
	 * own inventory change we are rapid-firing until the inventory prohibits the job from running
	 * (either full, or empty), so we want to avoid this with the following ✨clever solution✨:
	 */
	#avoidRespondingToOwnInventoryChange = false;

	/**
	 * Politely starts work on the blueprint if there is nothing stopping us from doing that.
	 *
	 * Returns a boolean on wether the blueprint if we now started or not.
	 */
	private attemptStartBlueprint(inventory: Inventory): boolean {
		const blueprint = this.$$blueprint.get();
		if (!blueprint) {
			return false;
		}
		if (this.isBusy()) {
			// Cannot start it now. The updated blueprint will be picked up on the next
			// production cycle. --> @TODO
			return false;
		}
		if (!blueprint.hasAllIngredients(inventory)) {
			// Cannot start it now. The production cycle may start again when the
			// inventory changes in such a way that there are enough materials --> @TODO
			return false;
		}

		this.#avoidRespondingToOwnInventoryChange = true;
		inventory.changeMultiple(
			blueprint.ingredients.map(({ material, quantity }) => ({ material, quantity: -quantity })),
		);
		this.#avoidRespondingToOwnInventoryChange = false;

		// Both setting the progress to something else, or changing the delta, will kick off some
		// timers on ProgressingNumericValue -- meaning the factory is busy again.
		// @TODO dedupe with the other places where $$progress or its delta are set
		const delta = 1 / blueprint.options.fullTimeEquivalent;
		this.$$progress.set(0);
		this.$$progress.setDelta(delta);

		return true;
	}
}
