import Game from '../Game.ts';
import { Collection } from '../classes/Collection.ts';
import { EventedValue, type SaveEventedValueJson } from '../classes/EventedValue.ts';
import { ProgressingNumericValue } from '../classes/ProgressingNumericValue.ts';
import { Blueprint, type SaveBlueprintJson } from '../inventory/Blueprint.ts';
import { Inventory, type SaveInventoryJson } from '../inventory/Inventory.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
import { type SimpleCoordinate } from '../types.ts';
import { BuildingEntity, type SaveBuildingEntityJson } from './entity.building.ts';
import { SavePersonEntityJson } from './entity.person.ts';
import { PersonEntity } from './entity.person.ts';
import { type EntityI } from './types.ts';

export type SaveFactoryBuildingEntityJson = SaveBuildingEntityJson & {
	options: FactoryBuildingEntityOptions;
	inventory: SaveInventoryJson;
	owner: SavePersonEntityJson;
	blueprint: SaveEventedValueJson;
};

export type FactoryBuildingEntityOptions = {
	/**
	 * The type of production work that goes on in this factory.
	 */
	blueprint: Blueprint;

	/**
	 * The maximum amount of workers that can participate in the production cycle.
	 */
	maxWorkers: number;

	/**
	 * The maximum amount of stacks held by this factory's inventory.
	 */
	maxStackSpace: number;
};

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'factory';

	/**
	 * A bag of goodies owned by this factory. It will add and subtract items as it works through
	 * production cycles of the blueprint.
	 */
	public readonly inventory: Inventory;

	public readonly owner: PersonEntity;

	/**
	 * Instantiation parameters.
	 */
	public readonly options: FactoryBuildingEntityOptions;

	/**
	 * The collection of PersonEntities working in this factory, providing production speed.
	 *
	 * Workers may join or leave at their leasure, so long as this.options.maxWorkers is not exceeded.
	 */
	public readonly $workers = new Collection<PersonEntity>();

	/**
	 * The blueprint this factory is busy with, if any.
	 */
	public readonly $blueprint = new EventedValue<Blueprint | null>(
		null,
		`${this.constructor.name} $blueprint`,
		{
			toJson(context, current) {
				return current ? current.toSaveJson(context) : null;
			},
			fromJson(context, saved) {
				return saved ? Blueprint.fromSaveJson(context, saved as SaveBlueprintJson) : null;
			},
		},
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

	public constructor(
		id: string,
		location: SimpleCoordinate,
		owner: PersonEntity,
		options: FactoryBuildingEntityOptions,
	) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});

		this.options = options;

		this.owner = owner;
		this.inventory = new Inventory(this.options.maxStackSpace);

		this.setBlueprint(this.options.blueprint);
		this.attemptStartBlueprint();

		this.$attach.on((game) => {
			this.$$progress.attach(game);
			this.$detach.once(() => this.$$progress.detach());

			// See if production can be started if the blueprint changes:
			this.$detach.once(this.$blueprint.on(() => this.attemptStartBlueprint()));

			// See if production is sped up/slowed down if the worker occupancy changes:
			this.$detach.once(
				this.$workers.$change.on(() => {
					if (this.isBusy() || this.$blueprint.get()?.hasAllIngredients(this.inventory)) {
						// Must already be busy or have the ingredients to start
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

	private setBlueprint(blueprint: Blueprint | null) {
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
	 *
	 * @TODO Should avoid setProgressDelta for its side-effect, because it is more expensive
	 *       than it has to be.
	 */
	private setProgressDelta() {
		const blueprint = this.$blueprint.get();
		if (!blueprint) {
			// Programmer error, you should have avoided calling this method:
			throw new Error(`No blueprint set`);
		}
		const delta = 1 / blueprint.options.fullTimeEquivalent;
		if (blueprint.options.workersRequired <= 0) {
			// If the blueprint does not require workers, process at 1x full speed
			this.$$progress.setDelta(delta);
		} else {
			this.$$progress.setDelta(
				Math.floor(this.$workers.length / blueprint.options.workersRequired) * delta,
			);
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
		if (this.isBusy()) {
			// Cannot start it now. The updated blueprint will be picked up on the next
			// production cycle. --> @TODO
			return false;
		}

		const blueprint = this.$blueprint.get();
		if (!blueprint) {
			this.$status.set('Waiting for instructions…');
			return false;
		}
		if (this.$workers.length < blueprint.options.workersRequired) {
			this.$status.set('Waiting for enough workers…');
			return false;
		}

		if (!blueprint.hasAllIngredients(this.inventory)) {
			this.$status.set('Waiting for the required materials…');
			return false;
		}
		if (!this.inventory.isEverythingAllocatable(blueprint.products)) {
			this.$status.set('Waiting to clear space for products…');
			return false;
		}

		this.$status.set('Working…');

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

	public toSaveJson(context: SaveJsonContext): SaveFactoryBuildingEntityJson {
		return {
			...super.toSaveJson(context),
			options: this.options,
			inventory: this.inventory.toSaveJson(context),
			owner: this.owner.toSaveJson(context),
			blueprint: this.$blueprint.toSaveJson(context),
		};
	}
	public static fromSaveJson(
		context: SaveJsonContext,
		save: SaveFactoryBuildingEntityJson,
	): FactoryBuildingEntity {
		const { id, location, options, inventory, owner, blueprint, status } = save;
		const inst = new FactoryBuildingEntity(
			id,
			location,
			PersonEntity.fromSaveJson(context, owner),
			options,
		);
		inst.inventory.overwriteFromSaveJson(context, inventory);
		inst.$blueprint.overwriteFromSaveJson(context, blueprint);
		inst.$status.overwriteFromSaveJson(context, status);
		return inst;
	}
}
