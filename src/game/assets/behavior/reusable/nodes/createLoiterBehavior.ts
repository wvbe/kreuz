import { Random } from '../../../../core/classes/Random';
import { BehaviorTreeSignal } from '../../../../core/ecs/components/behaviorComponent/BehaviorTreeSignal';
import { ExecutionNode } from '../../../../core/ecs/components/behaviorComponent/ExecutionNode';
import { rejectBehaviorTreeWhenMissingEcsComponent } from '../../../../core/ecs/components/behaviorComponent/rejectBehaviorTreeWhenMissingEcsComponent';
import { SelectorNode } from '../../../../core/ecs/components/behaviorComponent/SelectorNode';
import { SequenceNode } from '../../../../core/ecs/components/behaviorComponent/SequenceNode';
import { type EntityBlackboard } from '../../../../core/ecs/components/behaviorComponent/types';
import { eventLogComponent } from '../../../../core/ecs/components/eventLogComponent';
import { healthComponent } from '../../../../core/ecs/components/healthComponent';
import { getTileAtLocation } from '../../../../core/ecs/components/location/getTileAtLocation';
import { isMapLocationEqualTo } from '../../../../core/ecs/components/location/isMapLocationEqualTo';
import { locationComponent } from '../../../../core/ecs/components/locationComponent';
import { pathingComponent } from '../../../../core/ecs/components/pathingComponent';
import { type EcsEntity } from '../../../../core/ecs/types';
import Game from '../../../../core/Game';
import { QualifiedCoordinate } from '../../../../core/terrain/types';
import { createWaitBehavior } from './createWaitBehavior';

type EntityWithComponents = EcsEntity<
	| typeof locationComponent
	| typeof healthComponent
	| typeof pathingComponent
	| typeof eventLogComponent
>;

// Some "entropy" lolz0r
let ticker = 0;

function getRandomTileNearby([currentTerrain, ...currentCoords]: QualifiedCoordinate) {
	const closestTiles = currentTerrain.selectClosestTiles(
		currentCoords,
		5 * currentTerrain.sizeMultiplier,
	);
	if (!closestTiles.length) {
		throw new BehaviorTreeSignal(`Theres nowhere to wander to`);
	}

	// Naive implementaton of walking through a portal at random, if there's one around
	if (Math.random() < 0.25) {
		const portals = currentTerrain
			.getPortals()
			.filter((t) =>
				closestTiles.some((tile) =>
					isMapLocationEqualTo(tile.location.get(), [currentTerrain, ...t.portalStart]),
				),
			);

		// closestTiles.push(...portals.flatMap((portal) => portal.terrain.tiles.slice()));
		closestTiles.push(
			...portals.flatMap((portal) =>
				portal.terrain.selectClosestTiles(
					portal.terrain.getLocationOfPortalToTerrain(currentTerrain),
					5,
				),
			),
		);
	}

	return Random.fromArray(closestTiles, Math.random());
}

export function createLoiterBehavior() {
	return new SelectorNode<EntityBlackboard>(
		new SequenceNode(
			new ExecutionNode(
				'Wander',
				async ({ game, entity }: { game: Game; entity: EntityWithComponents }) => {
					rejectBehaviorTreeWhenMissingEcsComponent(entity, [
						locationComponent,
						pathingComponent,
						healthComponent,
					]);

					if (entity.isDead()) {
						throw new BehaviorTreeSignal(`Dead people cannot wander`);
					}

					if (eventLogComponent.test(entity)) {
						await entity.events?.add('Wandering around…');
					}
					const start = getTileAtLocation(entity.location.get());
					if (!start) {
						throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
					}
					await entity.walkToTile(game, getRandomTileNearby(start.location.get()), 10);
				},
			),
			createWaitBehavior(1000, 3000),
		),
		createWaitBehavior(1000, 3000, null),
	);
}
