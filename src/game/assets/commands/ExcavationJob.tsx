import { Spinner } from '../../../ui/hud/atoms/Spinner';
import { JobPosting } from '../../core/classes/JobPosting';
import { mapMarkerArchetype } from '../../core/ecs/archetypes/mapMarkerArchetype';
import { Tile } from '../../core/ecs/archetypes/tileArchetype';
import { assertEcsComponents, hasEcsComponents } from '../../core/ecs/assert';
import { eventLogComponent } from '../../core/ecs/components/eventLogComponent';
import { inventoryComponent } from '../../core/ecs/components/inventoryComponent';
import { locationComponent } from '../../core/ecs/components/locationComponent';
import { pathableComponent } from '../../core/ecs/components/pathableComponent';
import { pathingComponent } from '../../core/ecs/components/pathingComponent';
import { surfaceComponent, SurfaceType } from '../../core/ecs/components/surfaceComponent';
import { EcsArchetypeEntity, EcsEntity } from '../../core/ecs/types';
import Game from '../../core/Game';

export class ExcavationJob extends JobPosting {
	private marker: EcsArchetypeEntity<typeof mapMarkerArchetype> | null = null;

	constructor(private readonly tile: Tile) {
		super({
			location: tile.location.get(),
			label: 'Clear a space',
			vacancies: 1,
			restoreVacancyWhenDone: false,
		});
	}

	/**
	 * Returns true if the tile is excavateable, false otherwise.
	 *
	 * A tile is excavateable if:
	 * - It has the necessary ECS components
	 * - It is not already cleared
	 * - It is adjacent to a pathable neighbor
	 */
	public static tileIsExcavateable(game: Game, tile: EcsEntity): tile is Tile {
		if (!hasEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent])) {
			return false;
		}
		if (tile.surfaceType.get() !== SurfaceType.UNKNOWN) {
			return false;
		}
		// if (
		// 	!tile.pathingNeighbours.some(
		// 		(neighbour) =>
		// 			(neighbour as EcsEntity<typeof surfaceComponent>).surfaceType?.get() ===
		// 			SurfaceType.OPEN,
		// 	)
		// ) {
		// 	return false;
		// }

		// This lookup could be a lot cheaper if we indexed entities by X/Y
		if (
			game.entities.find(
				(entity) =>
					mapMarkerArchetype.test(entity) &&
					tile.equalsMapLocation(entity.location.get()),
			)
		) {
			// If there is already a mapmarker here, for whatever reason, do not excavate
			return false;
		}

		return true;
	}

	async onPost(game: Game) {
		assertEcsComponents(this.tile, [locationComponent, pathableComponent, surfaceComponent]);

		this.marker = mapMarkerArchetype.create({
			location: this.tile.location.get(),
			icon: '⛏️',
			name: 'Excavation site',
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

		await worker.events?.add('Excavating a space');
		try {
			await worker.walkToTile(game, this.tile, 1);
		} catch (error) {
			await worker.events?.add('Could not find a path close enough to the target');
			// Replace the job icon with a spinner while the job is in progress
			if (this.marker) {
				await game.entities.remove(this.marker);
			}
			// game.jobs.addGlobal(this);
			return;
		}

		// Replace the job icon with a spinner while the job is in progress
		if (this.marker) {
			await game.entities.remove(this.marker);
		}
		const spinner = mapMarkerArchetype.create({
			location: this.tile.location.get(),
			icon: <Spinner />,
			name: 'Excavation site',
		});
		await game.entities.add(spinner);
		await game.time.wait(30_000);
		await game.entities.remove(spinner);

		// Make the tile walkable now that it is excavated.
		this.tile.walkability = 1;
		this.tile.surfaceType.set(SurfaceType.OPEN);
	}
}
