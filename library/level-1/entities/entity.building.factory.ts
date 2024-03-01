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
import { attachSystem } from '../systems/blueprintProduction.ts';

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

		this.$attach.on(async (game) => {
			this.$blueprint.on((blueprint) => {
				if (!blueprint || blueprint.options.workersRequired < 1) {
					return;
				}
				const vacancy = new JobVacancy((blackboard) => this.assignJobToEntity(blackboard), {
					vacancies: this.options.maxWorkers,
					employer: this,
					score: ({ entity }) => {
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
							if (!blueprint.hasAllIngredients(this.inventory)) {
								// Not enough ingredients in inventory to start another production cycle
								VAL *= 0;
								return 0;
							}
						}

						return VAL;
					},
				});
				game.jobs.add(vacancy);
				this.$blueprint.once(() => game.jobs.remove(vacancy));
			});

			await this.$$progress.attach(game);

			this.$detach.once(async () => {
				await this.$$progress.detach();
			});
			attachSystem(this);
			this.$blueprint.set(this.options.blueprint);
		});
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
