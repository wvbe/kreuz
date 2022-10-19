import { EventedValue } from '../classes/EventedValue.ts';
import { ProgressingNumericValue } from '../classes/ProgressingNumericValue.ts';
import { FactoryBuildingEntity } from '../entities/FactoryBuildingEntity.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { Inventory } from '../inventory/Inventory.ts';
import { Job } from './Job.ts';
import { type JobI } from './types.ts';

export class ProductionJob extends Job<FactoryBuildingEntity> implements JobI {
	protected readonly $$progress = new ProgressingNumericValue(
		0,
		{ delta: 0 },
		`${this.constructor.name} $$progress`,
	);

	protected readonly $$blueprint = new EventedValue<Blueprint | null>(
		null,
		'FactoryBuildingEntity $$blueprint',
	);

	public constructor(entity: FactoryBuildingEntity, blueprint: Blueprint | null) {
		super(entity);

		this.$attach.on((game) => {
			this.$detach.once(
				this.$$blueprint.on((blueprint) => {
					if (!blueprint) {
						// Cancel a production cycle mid-way
						// @TODO
						return;
					}
					this.attemptStartBlueprint(entity.inventory);
				}),
			);

			this.$detach.once(
				this.$$progress.onBetween(1, Infinity, () => {
					// When the progress on a blueprint finishes, start the next one
					console.log('Blueprint complete, happy days');
					this.attemptStartBlueprint(entity.inventory);
				}),
			);

			this.$$progress.attach(game);
			this.$detach.once(() => this.$$progress.detach());

			this.$detach.once(
				entity.inventory.$change.on(() => {
					// @TODO handle the case where the inventory is changed in sucha  way that the
					// blueprint products cannot be placed.
					this.attemptStartBlueprint(entity.inventory);
				}),
			);
		});

		this.setBlueprint(blueprint);
	}

	public get label() {
		return this.$$blueprint.get()?.name || 'Not working on any blueprint';
	}

	private isBusy() {
		// To be busy, the factory must have a blueprint and the progression value must be "moving"
		return this.$$blueprint.get() && this.$$progress.delta > 0;
	}

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
		// @TODO start evaluating if we can run the blueprint.

		// Both setting the progress to something else, or changing the delta, will kick off some
		// timers on ProgressingNumericValue -- meaning the factory is busy again.
		const delta = 1 / blueprint.options.fullTimeEquivalent;
		this.$$progress.set(0);
		this.$$progress.setDelta(delta);

		return true;
	}

	public setBlueprint(blueprint: Blueprint | null) {
		if (this.isBusy()) {
			throw new Error('Cannot change blueprint while buiding is busy');
		}
		// @TODO chagne blueprint to something else, without unsetting it first?
		this.$$blueprint.set(blueprint);
	}
}
