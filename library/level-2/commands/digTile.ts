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
function createDigJob(game: Game, tile: TileEntity) {
	const assignJobToEntity = async (job: JobPosting, entity: EcsEntity) => {
		assertEcsComponents(entity, [pathingComponent, locationComponent, inventoryComponent]);

		game.jobs.removeGlobal(job);
		console.log('Dig job started');
		await entity.walkToTile(game, tile);
		await game.time.wait(30_000);
		tile.walkability = 1;
		tile.surfaceType.set(SurfaceType.OPEN);
		console.log('Dig job done');
	};

	game.jobs.addGlobal(
		new JobPosting(assignJobToEntity, {
			label: 'Dig',
			score: (entity) => {
				if (!hasEcsComponents(entity, [pathingComponent, locationComponent, inventoryComponent])) {
					return 0;
				}
				if (!entity.inventory.availableOf(game.assets.materials.get('pickaxe')!)) {
					return 0;
				}
				return 1;
			},
			vacancies: 1,
			restoreVacancyWhenDone: false,
		}),
	);
}

export const digTile = new Command<EntityBlackboard>(
	'Dig',
	({ entity }) => hasEcsComponents(entity, [locationComponent, pathableComponent]),
	({ game, entity }) => {
		assertEcsComponents(entity, [locationComponent, pathableComponent, surfaceComponent]);
		createDigJob(game, entity);
	},
);
