import { Collection } from '../classes/Collection.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import { ProgressingNumericValue } from '../classes/ProgressingNumericValue.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { Inventory } from '../inventory/Inventory.ts';
import { type CoordinateI } from '../types.ts';
import { BuildingEntity } from './entity.building.ts';
import { PersonEntity } from './entity.person.ts';
import { type EntityI } from './types.ts';

type FactoryBuildingEntityOptions = {
	/**
	 * The maximum amount of workers that can participate in the production cycle.
	 *
	 * - If set to "0", the factory will always be producing at its native production speed.
	 *   For example, a water well.
	 * - If set to a value higher than 0, the factory will produce at the occupancy/maxWorker ratio.
	 *   For example, a stone quarry.
	 */
	maxWorkers: number;
};

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'factory';

	/**
	 * A bag of goodies owned by this factory. It will add and subtract items as it works through
	 * production cycles of the blueprint.
	 */
	public readonly inventory = new Inventory(8);

	public readonly options: FactoryBuildingEntityOptions;

	/**
	 * The collection of PersonEntities working in this factory, providing production speed.
	 */
	public readonly $workers = new Collection<PersonEntity>();

	/**
	 * The blueprint this factory is busy with, if any.
	 */
	public readonly $blueprint = new EventedValue<Blueprint | null>(
		null,
		`${this.constructor.name} $blueprint`,
	);

	/**
	 * How far along the production of one cycle of the blueprint is, and its delta (at which rate
	 * progress increases).
	 */
	public readonly $$progress = new ProgressingNumericValue(
		0,
		{ min: 0, max: 1, delta: 0 },
		`${this.constructor.name} $$progress`,
	);

	public get name() {
		return this.$blueprint.get()?.options.buildingName || `Empty factory building`;
	}

	public get icon() {
		return '🏭';
	}

	public constructor(id: string, location: CoordinateI, options: FactoryBuildingEntityOptions) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
		this.options = options;

		this.$attach.on((game) => {
			this.$$progress.attach(game);
			this.$detach.once(() => this.$$progress.detach());

			// See if production can be started if the blueprint changes:
			this.$detach.once(this.$blueprint.on(() => this.attemptStartBlueprint()));

			// See if production is sped up/slowed down if the worker occupancy changes:
			this.$detach.once(
				this.$workers.$change.on(() => {
					console.log(`$workers $change ${this.$workers.length}`);
					if (this.isBusy() || this.$blueprint.get()?.hasAllIngredients(this.inventory)) {
						// Must already be busy or have the ingredients to start
						console.log(`- Set progress delta`);
						this.setProgressDelta();
					}
				}),
			);

			// See if production can be restarted if the inventory changes:
			// @TODO handle the case where the inventory is changed in sucha  way that the
			// blueprint products cannot be placed.
			this.$detach.once(
				this.inventory.$change.on(
					() => this.#avoidRespondingToOwnInventoryChange || this.attemptStartBlueprint(),
				),
			);

			// When production progress completes, restart again
			this.$detach.once(
				this.$$progress.onBetween(1, Infinity, () => {
					const blueprint = this.$blueprint.get();
					if (!blueprint) {
						// Indicative of a bug somewhere!
						throw new Error('Blueprint is somehow unset while the cycle is completing');
					}
					this.inventory.changeMultiple(blueprint.products);
					this.$$progress.set(0);
					if (!this.attemptStartBlueprint()) {
						this.$$progress.setDelta(0);
					}
				}),
			);
		});
	}

	public setBlueprint(blueprint: Blueprint | null) {
		if (this.isBusy()) {
			throw new Error('Cannot change blueprint while buiding is busy');
		}
		// @TODO chagne blueprint to something else, without unsetting it first?
		this.$blueprint.set(blueprint);
	}

	/**
	 * Sets the production speed of this factory, keeping in mind how long the blueprint normally
	 * takes and the amount of workers in this factory.
	 *
	 * Note that it ignores wether or not inventory materials are available!
	 */
	private setProgressDelta() {
		console.log('Setting progress delta');
		const blueprint = this.$blueprint.get();
		if (!blueprint) {
			// Programmer error, you should have avoided calling this method:
			throw new Error(`No blueprint set`);
		}
		const delta = 1 / blueprint.options.fullTimeEquivalent;
		if (this.options.maxWorkers === 0) {
			this.$$progress.setDelta(delta);
		} else {
			const multiplier = this.$workers.length / this.options.maxWorkers;
			this.$$progress.setDelta(delta * multiplier);
		}
	}

	private isBusy() {
		// To be busy;
		// - There must be a blueprint
		// - And you must have made progress with whatever you're doing
		// - And you must be continuing to make progress
		return this.$blueprint.get() && this.$$progress.delta > 0 && this.$$progress.get() > 0;
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
	private attemptStartBlueprint(): boolean {
		const blueprint = this.$blueprint.get();
		if (!blueprint) {
			return false;
		}
		if (!this.$workers.length) {
			return false;
		}
		if (this.isBusy()) {
			// Cannot start it now. The updated blueprint will be picked up on the next
			// production cycle. --> @TODO
			return false;
		}
		if (!blueprint.hasAllIngredients(this.inventory)) {
			// Cannot start it now. The production cycle may start again when the
			// inventory changes in such a way that there are enough materials --> @TODO
			return false;
		}

		this.#avoidRespondingToOwnInventoryChange = true;
		this.inventory.changeMultiple(
			blueprint.ingredients.map(({ material, quantity }) => ({ material, quantity: -quantity })),
		);
		this.#avoidRespondingToOwnInventoryChange = false;

		// Both setting the progress to something else, or changing the delta, will kick off some
		// timers on ProgressingNumericValue -- meaning the factory is busy again.
		// @TODO dedupe with the other places where $$progress or its delta are set
		this.$$progress.set(0);
		this.setProgressDelta();

		return true;
	}
}
