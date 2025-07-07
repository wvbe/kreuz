import React from 'react';
import { Spinner } from '../../../ui2/hud/atoms/spinner';
import { JobPosting } from '../../level-1/classes/JobPosting';
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

export type ExcavateableTile = EcsEntity<
	typeof locationComponent | typeof pathableComponent | typeof surfaceComponent
>;
export class ExcavationJob extends JobPosting {
	private marker: EcsArchetypeEntity<typeof mapMarkerArchetype> | null = null;

	constructor(private readonly tile: ExcavateableTile) {
		super({
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
	public static tileIsExcavateable(tile: EcsEntity): tile is ExcavateableTile {
		return (
			hasEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent]) &&
			tile.surfaceType.get() === SurfaceType.UNKNOWN &&
			tile.pathingNeighbours.some(
				(neighbour) =>
					(neighbour as EcsEntity<typeof surfaceComponent>).surfaceType?.get() ===
					SurfaceType.OPEN,
			)
		);
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

		game.jobs.removeGlobal(this);

		await worker.events?.add('Excavating a space');
		await worker.walkToTile(game, this.tile);

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
