import Game from '../Game.ts';
import { assertEcsComponents } from '../ecs/assert.ts';
import { JobPosting } from '../ecs/components/behaviorComponent/JobPosting.ts';
import { inventoryComponent } from '../ecs/components/inventoryComponent.ts';
import { locationComponent } from '../ecs/components/locationComponent.ts';
import { pathingComponent } from '../ecs/components/pathingComponent.ts';
import { EcsEntity } from '../ecs/types.ts';
import { SimpleCoordinate } from '../terrain/types.ts';

export function createDigJob(game: Game, location: SimpleCoordinate) {
	const score = () => 1;
	const assignJobToEntity = async (job: JobPosting, entity: EcsEntity) => {
		assertEcsComponents(entity, [pathingComponent, locationComponent, inventoryComponent]);

		const tile = game.terrain.getTileClosestToXy(location[0], location[1]);
		await entity.walkToTile(game, tile);
		// tile.
	};
}
