import { Spinner } from '../../../ui2/hud/atoms/Spinner';
import { JobPosting } from '../../level-1/classes/JobPosting';
import { Prompt } from '../../level-1/classes/Prompt';
import { mapMarkerArchetype } from '../../level-1/ecs/archetypes/mapMarkerArchetype';
import { assertEcsComponents, hasEcsComponents } from '../../level-1/ecs/assert';
import { eventLogComponent } from '../../level-1/ecs/components/eventLogComponent';
import { inventoryComponent } from '../../level-1/ecs/components/inventoryComponent';
import { locationComponent } from '../../level-1/ecs/components/locationComponent';
import { pathableComponent } from '../../level-1/ecs/components/pathableComponent';
import { pathingComponent } from '../../level-1/ecs/components/pathingComponent';
import { surfaceComponent, SurfaceType } from '../../level-1/ecs/components/surfaceComponent';
import { EcsArchetypeEntity, EcsEntity } from '../../level-1/ecs/types';
import Game from '../../level-1/Game';
import { ExcavateableTile } from '../commands/ExcavationJob';
import { Constructible } from './types';

/**
 * Identifier for the prompt that asks the user to select an entity to construct.
 */
export const PROMPT_CONSTRUCTION_JOB = new Prompt<{
	derp: boolean;
}>();

export class ConstructionJob extends JobPosting {
	private marker: EcsArchetypeEntity<typeof mapMarkerArchetype> | null = null;

	constructor(private readonly tile: ExcavateableTile, private readonly thing: Constructible) {
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
			name: `Building a ${this.thing.label}`,
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
			name: `Building a ${this.thing.label}`,
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
