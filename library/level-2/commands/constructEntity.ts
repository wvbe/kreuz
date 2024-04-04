import {
	Command,
	EcsEntity,
	EntityBlackboard,
	Game,
	JobPosting,
	Prompt,
	SurfaceType,
	assertEcsComponents,
	inventoryComponent,
	locationComponent,
	pathableComponent,
	pathingComponent,
	surfaceComponent,
} from '@lib/core';
import { hasEcsComponents } from '../../level-1/ecs/assert.ts';

type TileEntity = EcsEntity<
	typeof locationComponent | typeof surfaceComponent | typeof pathableComponent
>;

/**
 * Identifier for the prompt that asks the user to select an entity to construct.
 */
export const PROMPT_CONSTRUCTION_JOB = new Prompt<{ entity: EcsEntity }>();

async function createConstructionJob(game: Game, tile: TileEntity, buildTarget: EcsEntity) {
	console.log('WANNA BUILD', buildTarget);
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

	async ({ game, entity: tile }) => {
		assertEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent]);
		try {
			const { entity } = await game.prompt(PROMPT_CONSTRUCTION_JOB);
			createConstructionJob(game, tile, entity);
		} catch (error) {
			if (error === undefined) {
				// User cancelled prompt:
				// Do nothing
			} else {
				throw error;
			}
		}
	},
);
