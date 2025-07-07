import React from 'react';
import { Spinner } from '../../../ui2/hud/atoms/spinner';
import { JobPosting } from '../../level-1/classes/JobPosting';
import { Prompt } from '../../level-1/classes/Prompt';
import {
	createFactoryForBlueprint,
	factoryArchetype,
} from '../../level-1/ecs/archetypes/factoryArchetype';
import { mapMarkerArchetype } from '../../level-1/ecs/archetypes/mapMarkerArchetype';
import {
	createMarketForMaterial,
	marketArchetype,
} from '../../level-1/ecs/archetypes/marketArchetype';
import { assertEcsComponents, hasEcsComponents } from '../../level-1/ecs/assert';
import { EcsArchetype } from '../../level-1/ecs/classes/EcsArchetype';
import { eventLogComponent } from '../../level-1/ecs/components/eventLogComponent';
import { inventoryComponent } from '../../level-1/ecs/components/inventoryComponent';
import { locationComponent } from '../../level-1/ecs/components/locationComponent';
import { pathableComponent } from '../../level-1/ecs/components/pathableComponent';
import { pathingComponent } from '../../level-1/ecs/components/pathingComponent';
import { Blueprint } from '../../level-1/ecs/components/productionComponent/Blueprint';
import { surfaceComponent, SurfaceType } from '../../level-1/ecs/components/surfaceComponent';
import { wealthComponent } from '../../level-1/ecs/components/wealthComponent';
import { EcsArchetypeEntity, EcsEntity } from '../../level-1/ecs/types';
import Game from '../../level-1/Game';
import { Material } from '../../level-1/inventory/Material';
import { SimpleCoordinate } from '../../level-1/terrain/types';
import { ExcavateableTile } from './ExcavationJob';

/**
 * Identifier for the prompt that asks the user to select an entity to construct.
 */
export const PROMPT_CONSTRUCTION_JOB = new Prompt<{
	buildingType: EcsArchetype<any, any>;
	buildingFocus: Blueprint | Material;
}>();

export class ConstructionJob extends JobPosting {
	private marker: EcsArchetypeEntity<typeof mapMarkerArchetype> | null = null;

	constructor(
		private readonly tile: ExcavateableTile,
		private readonly owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>,
		private readonly buildingType: EcsArchetype<any, any>,
		private readonly buildingFocus: Blueprint | Material,
	) {
		super({
			label: 'Building a thing',
			vacancies: 1,
			restoreVacancyWhenDone: false,
		});
	}

	/**
	 * Returns true if the tile can be built on.
	 *
	 * A tile is buildable if:
	 * - It has the necessary ECS components
	 * - It is already cleared
	 */
	public static tileIsBuildable(tile: EcsEntity): tile is ExcavateableTile {
		return (
			// Only valid for tiles...
			hasEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent]) &&
			// ... that are not already cleared...
			tile.surfaceType.get() === SurfaceType.OPEN
		);
	}

	async onPost(game: Game) {
		assertEcsComponents(this.tile, [locationComponent, pathableComponent, surfaceComponent]);

		this.marker = mapMarkerArchetype.create({
			location: this.tile.location.get(),
			icon: '🚧',
			name: 'Construction site',
		});

		await game.entities.add(this.marker);
	}

	onScore(game: Game, worker: EcsEntity): number {
		// @TODO keep in mind that the entity must be able to reach (a neighbor) of the tile
		if (!hasEcsComponents(worker, [pathingComponent, locationComponent, inventoryComponent])) {
			return 0;
		}
		// if (!worker.inventory.availableOf(game.assets.materials.get('pickaxe')!)) {
		// 	return 0;
		// }
		return 1;
	}

	async onAssign(game: Game, worker: EcsEntity): Promise<void> {
		assertEcsComponents(
			worker,
			[pathingComponent, locationComponent, inventoryComponent],
			[eventLogComponent],
		);

		game.jobs.removeGlobal(this);

		await worker.events?.add('Building a thing');
		await worker.walkToTile(game, this.tile);

		// Replace the job icon with a spinner while the job is in progress
		if (this.marker) {
			await game.entities.remove(this.marker);
		}
		const spinner = mapMarkerArchetype.create({
			location: this.tile.location.get(),
			icon: <Spinner />,
			name: 'Construction site',
		});
		await game.entities.add(spinner);
		await game.time.wait(30_000);
		await game.entities.remove(spinner);

		// Make the tile walkable now that it is excavated.
		this.tile.walkability = 1;
		this.tile.surfaceType.set(SurfaceType.OPEN);

		game.entities.add(await this.createBuiltEntity(game, this.tile.location.get()));
	}

	private async createBuiltEntity(game: Game, location: SimpleCoordinate) {
		switch (this.buildingType) {
			case factoryArchetype:
				return createFactoryForBlueprint(
					this.buildingFocus as Blueprint,
					this.owner,
					location,
				);
			case marketArchetype:
				return createMarketForMaterial(
					this.buildingFocus as Material,
					this.owner,
					location,
				);
			default:
				throw new Error(`Unknown building type: ${this.buildingType}`);
		}
	}
}
