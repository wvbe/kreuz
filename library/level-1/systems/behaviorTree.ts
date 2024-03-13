import Game from '../Game.ts';
import { BehaviorTreeSignal } from '../behavior/BehaviorTreeSignal.ts';
import { PersonEntityBehavior } from '../entities/entity.person.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { EntityI } from '../entities/types.ts';
import { Event } from '../events/Event.ts';
import { EventedValue } from '../events/EventedValue.ts';

type BehavingEntity = EntityI & {
	$behavior: EventedValue<PersonEntityBehavior>;
};

function attachSystemToEntity(game: Game, entity: BehavingEntity) {
	let behaviorLoopEnabled = false;

	const doBehaviourLoop = async () => {
		if (behaviorLoopEnabled) {
			throw new Error('You should not start two behavior loops at once');
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
				entity: entity as PersonEntity,
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
		doBehaviourLoop();
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

export async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is BehavingEntity =>
						(entity as PersonEntity).$behavior instanceof EventedValue,
				)
				.map((entity) => attachSystemToEntity(game, entity)),
		);
	});
}
