import { JsonValue } from 'https://deno.land/std@0.185.0/json/common.ts';
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
import { JobVacancy } from '../behavior/JobVacancy.ts';
import { EntityBlackboard } from '../behavior/types.ts';

export type SaveFactoryBuildingEntityJson = SaveBuildingEntityJson & {
	options: FactoryBuildingEntityOptions;
	inventory: SaveInventoryJson;
	owner: SavePersonEntityJson;
	blueprint: SaveEventedValueJson<JsonValue | string>;
};

export type FactoryBuildingEntityOptions = {
	/**
	 * Not used by a factory instance, but may be used in a build menu or other. A one-sentence
	 * description of what this type of factory does.
	 */
	description?: string;

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
	public type = 'factory';

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
			toJson: (context, current) =>
				current
					? // Return a registry reference if it exists, or serialize the JSON object for that blueprint
					  context.blueprints.key(current, false) || current.toSaveJson(context)
					: null,
			fromJson: async (context, saved) =>
				saved
					? typeof saved === 'string'
						? // Load from registry if the saved value was a (string) key
						  context.blueprints.item(saved as string)
						: // Create a blueprint from JSON otherwise
						  Blueprint.fromSaveJson(context, saved as SaveBlueprintJson)
					: null,
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
		const blueprint = this.$blueprint.get();
		if (blueprint) {
			return blueprint.products.map(({ material }) => material.symbol).join('+');
		}
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

		void this.setBlueprint(this.options.blueprint).then(() => {
			void this.attemptStartBlueprint();
		});

		this.$attach.on(async (game) => {
			game.jobs.add(
				new JobVacancy(
					this.options.maxWorkers,
					({ entity }) => {
						let VAL = 1;

						const maximumDistanceWillingToTravel = 14,
							distanceToJob = entity.$$location.get().euclideanDistanceTo(this.$$location.get()),
							// 1 = very close job, 0 = infinitely far
							distanceMultiplier = Math.max(
								0,
								(maximumDistanceWillingToTravel - distanceToJob) / maximumDistanceWillingToTravel,
							);

						VAL *= distanceMultiplier;

						if (distanceMultiplier > 0) {
							if (!this.$blueprint.get()?.hasAllIngredients(this.inventory)) {
								// Not enough ingredients in inventory to start another production cycle
								VAL *= 0;
								return 0;
							}
						}

						return VAL;
					},
					(blackboard) => this.assignJobToEntity(blackboard),
				),
			);

			await this.$$progress.attach(game);

			this.$detach.once(async () => {
				await this.$$progress.detach();
			});

			// See if production can be started if the blueprint changes:
			this.$detach.once(this.$blueprint.on(() => this.attemptStartBlueprint()));

			// See if production is sped up/slowed down if the worker occupancy changes:
			this.$detach.once(
				this.$workers.$change.on(async () => {
					if (this.isBusy() || this.$blueprint.get()?.hasAllIngredients(this.inventory)) {
						// Must already be busy or have the ingredients to start
						// Void, do not await, setting the progress delta and its follow-up listeners
						void this.setProgressDelta();
					}
				}),
			);

			// See if production can be restarted if the inventory changes:
			// @TODO handle the case where the inventory is changed in such a way that the
			// blueprint products cannot be placed.
			this.$detach.once(
				this.inventory.$change.on(
					async () =>
						// Void, do not await, setting starting a new blueprint and its follow-up listeners
						this.#avoidRespondingToOwnInventoryChange || void this.attemptStartBlueprint(),
				),
			);

			// When production progress completes, restart again, or stop altogether
			this.$detach.once(
				this.$$progress.onBetween(1, Infinity, async () => {
					const blueprint = this.$blueprint.get();
					if (!blueprint) {
						// Indicative of a bug somewhere!
						throw new Error('Blueprint is somehow unset while the cycle is completing');
					}
					await this.inventory.changeMultiple(blueprint.products);
					await this.$$progress.set(0);
					if (!(await this.attemptStartBlueprint())) {
						await this.$$progress.setDelta(0);
					}
				}),
			);
		});
	}

	private async setBlueprint(blueprint: Blueprint | null) {
		if (this.isBusy()) {
			throw new Error('Cannot change blueprint while buiding is busy');
		}
		// @TODO chagne blueprint to something else, without unsetting it first?
		await this.$blueprint.set(blueprint);
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
	private async setProgressDelta() {
		const blueprint = this.$blueprint.get();
		if (!blueprint) {
			// Programmer error, you should have avoided calling this method:
			throw new Error(`No blueprint set`);
		}
		const delta = 1 / blueprint.options.fullTimeEquivalent;
		if (blueprint.options.workersRequired <= 0) {
			// If the blueprint does not require workers, process at 1x full speed
			await this.$$progress.setDelta(delta);
		} else {
			const penaltyModifier = this.$workers.length < blueprint.options.workersRequired ? 0.3 : 1;
			await this.$$progress.setDelta(
				(this.$workers.length / blueprint.options.workersRequired) * delta * penaltyModifier,
			);
		}
	}

	private async assignJobToEntity({ game, entity }: EntityBlackboard) {
		await entity.$status.set(`Going to ${this} for work`);
		const tile = game.terrain.getTileEqualToLocation(this.$$location.get());
		await entity.walkToTile(tile);

		await this.$workers.add(entity);

		await entity.$status.set(`Working in ${this}`);

		// Finish job when one work cycle completes
		await new Promise<void>((resolve) => {
			this.$$progress.onceAbove(1, () => resolve(), true);
		});

		// entity.$$location.once(async () => {
		await this.$workers.remove(entity);
		// });
		await entity.$status.set(null);
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
	private async attemptStartBlueprint(): Promise<boolean> {
		if (this.isBusy()) {
			// Cannot start it now. The updated blueprint will be picked up on the next
			// production cycle. --> @TODO
			return false;
		}

		const blueprint = this.$blueprint.get();
		if (!blueprint) {
			await this.$status.set('Waiting for instructions…');
			return false;
		}
		// if (this.$workers.length < blueprint.options.workersRequired) {
		// 	await this.$status.set('Waiting for enough workers…');
		// 	return false;
		// }

		if (!blueprint.hasAllIngredients(this.inventory)) {
			await this.$status.set('Waiting for the required materials…');
			return false;
		}
		if (!this.inventory.isEverythingAllocatable(blueprint.products)) {
			await this.$status.set('Waiting to clear space for products…');
			return false;
		}

		await this.$status.set('Working…');

		this.#avoidRespondingToOwnInventoryChange = true;
		await this.inventory.changeMultiple(
			blueprint.ingredients.map(({ material, quantity }) => ({ material, quantity: -quantity })),
		);
		this.#avoidRespondingToOwnInventoryChange = false;

		// Both setting the progress to something else, or changing the delta, will kick off some
		// timers on ProgressingNumericValue -- meaning the factory is busy again.
		// @TODO dedupe with the other places where $$progress or its delta are set
		await this.$$progress.set(0);
		await this.setProgressDelta();

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

	public static async fromSaveJson(
		context: SaveJsonContext,
		save: SaveFactoryBuildingEntityJson,
	): Promise<FactoryBuildingEntity> {
		const { id, location, options, inventory, owner, blueprint, status } = save;
		const inst = new this(id, location, await PersonEntity.fromSaveJson(context, owner), options);
		await inst.inventory.overwriteFromSaveJson(context, inventory);
		await inst.$blueprint.overwriteFromSaveJson(context, blueprint);
		await inst.$status.overwriteFromSaveJson(context, status);
		return inst;
	}
}
