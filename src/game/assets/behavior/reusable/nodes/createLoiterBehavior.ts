import { Random } from '../../../../core/classes/Random';
import { BehaviorTreeSignal } from '../../../../core/ecs/components/behaviorComponent/BehaviorTreeSignal';
import { ExecutionNode } from '../../../../core/ecs/components/behaviorComponent/ExecutionNode';
import { rejectBehaviorTreeWhenMissingEcsComponent } from '../../../../core/ecs/components/behaviorComponent/rejectBehaviorTreeWhenMissingEcsComponent';
import { SelectorNode } from '../../../../core/ecs/components/behaviorComponent/SelectorNode';
import { SequenceNode } from '../../../../core/ecs/components/behaviorComponent/SequenceNode';
import { type EntityBlackboard } from '../../../../core/ecs/components/behaviorComponent/types';
import { eventLogComponent } from '../../../../core/ecs/components/eventLogComponent';
import { healthComponent } from '../../../../core/ecs/components/healthComponent';
import { locationComponent } from '../../../../core/ecs/components/locationComponent';
import { pathingComponent } from '../../../../core/ecs/components/pathingComponent';
import { type EcsEntity } from '../../../../core/ecs/types';
import Game from '../../../../core/Game';
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

					if (eventLogComponent.test(entity)) {
						await entity.events?.add('Wandering around…');
					}
					const start = game.terrain.getTileAtMapLocation(entity.location.get());
					if (!start) {
						throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
					}
					const closestTiles = game.terrain.selectClosestTiles(
						start.location.get(),
						5 * game.terrain.sizeMultiplier,
					);
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
