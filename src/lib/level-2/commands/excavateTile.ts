import { mapMarkerArchetype } from '../../level-1/ecs/archetypes/mapMarkerArchetype';
import {
	eventLogComponent,
	inventoryComponent,
	locationComponent,
	pathableComponent,
	pathingComponent,
	surfaceComponent,
} from '../../level-1/ecs/components';
import { type EntityBlackboard } from '../../level-1/ecs/components/behaviorComponent/types';
import { Command } from '../../level-1/ecs/components/commandComponent';
import { JobPosting } from '../../level-1/ecs/components/jobComponent';
import { SurfaceType } from '../../level-1/ecs/components/surfaceComponent';
import { type EcsEntity } from '../../level-1/ecs/types';
import { assertEcsComponents, hasEcsComponents } from '../../level-1/ecs/utils';

type TileEntity = EcsEntity<
	typeof locationComponent | typeof surfaceComponent | typeof pathableComponent
>;

/**
 * A command that queues an unknown surface area for excavation by a worker. Excavating it will make
 * the surface walkable/pathable.
 */
export const excavateTile = new Command<EntityBlackboard>(
	'⛏️ Clear this space',
	({ entity }) =>
		// Only valid for tiles...
		hasEcsComponents(entity, [locationComponent, pathableComponent, surfaceComponent]) &&
		// ... that are not already cleared...
		entity.surfaceType.get() === SurfaceType.UNKNOWN &&
		// ... and are adjacent to a pathable neighbor
		entity.pathingNeighbours.some(
			(neighbour) =>
				(neighbour as EcsEntity<typeof surfaceComponent>).surfaceType?.get() ===
				SurfaceType.OPEN,
		),
	async ({ game, entity: tile }) => {
		assertEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent]);

		const marker = mapMarkerArchetype.create({
			location: tile.location.get(),
			icon: '⛏️',
			name: 'Excavation site',
		});
		await game.entities.add(marker);
		// When the command is executed, create a job for a worker to do the rest:
		game.jobs.addGlobal(
			new JobPosting(
				async (job, worker) => {
					assertEcsComponents(
						worker,
						[pathingComponent, locationComponent, inventoryComponent],
						[eventLogComponent],
					);
					await worker.events?.add('Excavating a space');
					await worker.walkToTile(game, tile);
					await game.time.wait(30_000);
					tile.walkability = 1;
					tile.surfaceType.set(SurfaceType.OPEN);
					game.jobs.removeGlobal(job);
					await game.entities.remove(marker);
				},
				{
					label: 'Clear a space',
					score: (worker) => {
						// @TODO keep in mind that the entity must be able to reach (a neighbor) of the tile
						if (
							!hasEcsComponents(worker, [
								pathingComponent,
								locationComponent,
								inventoryComponent,
							])
						) {
							return 0;
						}
						if (!worker.inventory.availableOf(game.assets.materials.get('pickaxe')!)) {
							return 0;
						}
						return 1;
					},
					vacancies: 1,
					restoreVacancyWhenDone: false,
				},
			),
		);
	},
);
