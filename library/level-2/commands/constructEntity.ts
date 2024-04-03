import { Command, EcsEntity, EntityBlackboard, pathableComponent } from '@lib/core';

import {
	Game,
	JobPosting,
	assertEcsComponents,
	inventoryComponent,
	locationComponent,
	pathingComponent,
} from '@lib/core';
import { hasEcsComponents } from '../../level-1/ecs/assert.ts';
import { SurfaceType } from '@lib/core';
import { surfaceComponent } from '@lib/core';

type TileEntity = EcsEntity<
	typeof locationComponent | typeof surfaceComponent | typeof pathableComponent
>;
function createConstructionJob(game: Game, tile: TileEntity) {
	const assignJobToEntity = async (job: JobPosting, worker: EcsEntity) => {
		assertEcsComponents(worker, [pathingComponent, locationComponent, inventoryComponent]);
		await worker.walkToTile(game, tile);
		await game.time.wait(30_000);

		// TODO Add new entity to the game here

		game.jobs.removeGlobal(job);
	};

	game.jobs.addGlobal(
		new JobPosting(assignJobToEntity, {
			label: 'Clear a space',
			score: (worker) => {
				// @TODO keep in mind that the entity must be able to reach (a neighbor) of the tile
				if (!hasEcsComponents(worker, [pathingComponent, locationComponent, inventoryComponent])) {
					return 0;
				}
				if (!worker.inventory.availableOf(game.assets.materials.get('pickaxe')!)) {
					return 0;
				}
				return 1;
			},
			vacancies: 1,
			restoreVacancyWhenDone: false,
		}),
	);
}

/**
 * A command that queues an unknown surface area for excavation by a worker. Excavating it will make
 * the surface walkable/pathable.
 */
export const constructEntity = new Command<EntityBlackboard>(
	'🚧 Build a thing here',
	({ entity }) =>
		// Only valid for tiles...
		hasEcsComponents(entity, [locationComponent, pathableComponent, surfaceComponent]) &&
		// ... that are not already cleared...
		entity.surfaceType.get() === SurfaceType.OPEN,
	({ game, entity: tile }) => {
		assertEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent]);
		createConstructionJob(game, tile);
	},
);
