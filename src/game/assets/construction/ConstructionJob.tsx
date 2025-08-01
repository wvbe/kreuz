import { Spinner } from '../../../ui/hud/atoms/Spinner';
import { JobPosting } from '../../core/classes/JobPosting';
import { Prompt } from '../../core/classes/Prompt';
import { mapMarkerArchetype } from '../../core/ecs/archetypes/mapMarkerArchetype';
import { Tile, tileArchetype } from '../../core/ecs/archetypes/tileArchetype';
import { assertEcsComponents, hasEcsComponents } from '../../core/ecs/assert';
import { eventLogComponent } from '../../core/ecs/components/eventLogComponent';
import { inventoryComponent } from '../../core/ecs/components/inventoryComponent';
import { locationComponent } from '../../core/ecs/components/locationComponent';
import { pathableComponent } from '../../core/ecs/components/pathableComponent';
import { pathingComponent } from '../../core/ecs/components/pathingComponent';
import { surfaceComponent, SurfaceType } from '../../core/ecs/components/surfaceComponent';
import { EcsArchetypeEntity, EcsEntity } from '../../core/ecs/types';
import Game from '../../core/Game';
import { Constructible } from './types';

/**
 * Identifier for the prompt that asks the user to select an entity to construct.
 */
export const PROMPT_CONSTRUCTION_JOB = new Prompt<{
	derp: boolean;
}>();

export class ConstructionJob extends JobPosting {
	private marker: EcsArchetypeEntity<typeof mapMarkerArchetype> | null = null;

	constructor(private readonly tile: Tile, private readonly thing: Constructible) {
		super({
			location: tile.location.get(),
			label: `Build a ${thing.label.toLowerCase()}`,
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
	public static tileIsBuildable(game: Game, tile: EcsEntity): tile is Tile {
		if (!hasEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent])) {
			return false;
		}
		if (tile.surfaceType.get() !== SurfaceType.OPEN) {
			return false;
		}

		// This lookup could be a lot cheaper if we indexed entities by X/Y
		if (
			game.entities.find(
				(entity) =>
					!tileArchetype.test(entity) &&
					hasEcsComponents(entity, [locationComponent]) &&
					tile.equalsMapLocation(entity.location.get()),
			)
		) {
			return false;
		}
		return true;
	}

	async onPost(game: Game) {
		assertEcsComponents(this.tile, [locationComponent, pathableComponent, surfaceComponent]);

		this.marker = mapMarkerArchetype.create({
			location: this.tile.location.get(),
			icon: '🚧',
			name: `Placeholder for ${this.thing.label.toLowerCase()}`,
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

		game.jobs.remove(this);

		await worker.events?.add(`Building a ${this.thing.label.toLowerCase()}`);
		await worker.walkToTile(game, this.tile);

		// Replace the job icon with a spinner while the job is in progress
		if (this.marker) {
			await game.entities.remove(this.marker);
		}
		const spinner = mapMarkerArchetype.create({
			location: this.tile.location.get(),
			icon: <Spinner />,
			name: `Building a ${this.thing.label.toLowerCase()}`,
		});
		await game.entities.add(spinner);
		await game.time.wait(30_000);
		await game.entities.remove(spinner);

		// Make the tile walkable now that it is excavated.
		this.tile.walkability = 1;
		this.tile.surfaceType.set(SurfaceType.OPEN);

		if (this.thing.construction.createEntity) {
			game.entities.add(
				this.thing.construction.createEntity(this.thing, this.tile.location.get()),
			);
		} else {
			// Todo, place this in an inventory or whatever
			throw new Error('No createEntity function provided for this thing');
		}
	}

	// private async createBuiltEntity(game: Game, location: SimpleCoordinate) {
	// 	switch (this.buildingType) {
	// 		case factoryArchetype:
	// 			return createFactoryForBlueprint(
	// 				this.buildingFocus as Blueprint,
	// 				this.owner,
	// 				location,
	// 			);
	// 		case marketArchetype:
	// 			return createMarketForMaterial(
	// 				this.buildingFocus as Material,
	// 				this.owner,
	// 				location,
	// 			);
	// 		default:
	// 			throw new Error(`Unknown building type: ${this.buildingType}`);
	// 	}
	// }
}
