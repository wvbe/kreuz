import type Game from '../../Game.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { EcsArchetypeEntity } from '../types.ts';
import { BehaviorTreeSignal } from '../components/behaviorComponent/BehaviorTreeSignal.ts';
import { personArchetype } from '../archetypes/personArchetype.ts';
import { behaviorComponent } from '../components/behaviorComponent.ts';
import { EcsEntity } from '../types.ts';
import { healthComponent } from '../components/healthComponent.ts';

/**
 * Loops through a behavior tree for a capable entity. The behavior tree will hopefully make the entity do stuff.
 */
function attachSystemToEntity(
	game: Game,
	entity: EcsEntity<typeof behaviorComponent | typeof healthComponent>,
) {
	let behaviorLoopEnabled = false;

	const doBehaviourLoop = async () => {
		if (behaviorLoopEnabled) {
			throw new Error('You should not start two behavior loops at once');
		}
		if (!entity.$health.get()) {
			// Exiting loop because entity is dead
			return;
		}
		const behavior = entity.$behavior.get();
		if (!behavior) {
			return;
		}
		behaviorLoopEnabled = true;
		try {
			await behavior.evaluate({
				game,
				// @TODO get rid of this type coercion. The behavior tree, too,
				// should not care what kind of entity it is dealing with.
				entity,
			});
		} catch (error: Error | BehaviorTreeSignal | unknown) {
			if ((error as BehaviorTreeSignal)?.type !== 'fail') {
				throw error;
			}
			// The following means that the entity will retry the behavior tree again in the same
			// frame if it fails entirely. This is probably not what you want, since it can lead
			// to max call stack size exceeeded errors -- but simply waiting to retry again
			// is not a great fix either. Instead the behavior tree should be fixed.
		}

		behaviorLoopEnabled = false;

		// Do the behavior loop again in the next frame, not immediately, so that the game loop has
		// a chance to end.
		game.time.setTimeout(doBehaviourLoop, 1);
	};

	entity.$behavior.on(async () => {
		if (behaviorLoopEnabled) {
			// @TODO Cancel the previous behavior if there was one
			return;
		}
		// Do not await the behaviour loop, because it never ends
		void doBehaviourLoop();
	});

	doBehaviourLoop();
}

/**
 * A system that runs behavior trees for entities of the {@link personArchetype} archetype.
 */
export const behaviorTreeSystem = new EcsSystem([], (game) => {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is EcsEntity<typeof behaviorComponent | typeof healthComponent> =>
						behaviorComponent.test(entity) && healthComponent.test(entity),
				)
				.map((entity) => attachSystemToEntity(game, entity)),
		);
	});
});
