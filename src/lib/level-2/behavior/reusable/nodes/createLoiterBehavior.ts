import { Random } from '../../../../level-1/classes/Random';
import { BehaviorTreeSignal } from '../../../../level-1/ecs/components/behaviorComponent/BehaviorTreeSignal';
import { ExecutionNode } from '../../../../level-1/ecs/components/behaviorComponent/ExecutionNode';
import { rejectBehaviorTreeWhenMissingEcsComponent } from '../../../../level-1/ecs/components/behaviorComponent/rejectBehaviorTreeWhenMissingEcsComponent';
import { SelectorNode } from '../../../../level-1/ecs/components/behaviorComponent/SelectorNode';
import { SequenceNode } from '../../../../level-1/ecs/components/behaviorComponent/SequenceNode';
import { type EntityBlackboard } from '../../../../level-1/ecs/components/behaviorComponent/types';
import { eventLogComponent } from '../../../../level-1/ecs/components/eventLogComponent';
import { healthComponent } from '../../../../level-1/ecs/components/healthComponent';
import { locationComponent } from '../../../../level-1/ecs/components/locationComponent';
import { pathingComponent } from '../../../../level-1/ecs/components/pathingComponent';
import { type EcsEntity } from '../../../../level-1/ecs/types';
import Game from '../../../../level-1/Game';
import { createWaitBehavior } from './createWaitBehavior';

type EntityWithComponents = EcsEntity<
	| typeof locationComponent
	| typeof healthComponent
	| typeof pathingComponent
	| typeof eventLogComponent
>;

// Some "entropy" lolz0r
let ticker = 0;

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

					if (entity.health.get() <= 0) {
						throw new BehaviorTreeSignal(`Dead people cannot wander`);
					}

					// if ((entity.needs.energy.get() || 0) < 0.2) {
					// 	throw new BehaviorTreeSignal(`${entity} is too tired to wander around`);
					// }
					if (eventLogComponent.test(entity)) {
						await entity.events?.add('Wandering around…');
					}
					const start = game.terrain.getTileEqualToLocation(entity.location.get());
					if (!start) {
						throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
					}
					const closestTiles = game.terrain.selectClosestTiles(start.location.get(), 5);
					if (!closestTiles.length) {
						throw new BehaviorTreeSignal(`Theres nowhere to wander to for ${entity}`);
					}
					const destination = Random.fromArray(
						closestTiles,
						entity.id,
						'loiter walk',
						++ticker,
					);

					await entity.walkToTile(game, destination);
				},
			),
			createWaitBehavior(1000, 3000),
		),
		createWaitBehavior(1000, 3000, null),
	);
}
