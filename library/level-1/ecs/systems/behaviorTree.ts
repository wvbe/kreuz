import Game from '../../Game.ts';
import { BehaviorTreeSignal } from '../../behavior/BehaviorTreeSignal.ts';
import { behaviorComponent } from '../components/behaviorComponent.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { EcsEntity } from '../types.ts';

type BehavingEntity = EcsEntity<typeof behaviorComponent>;

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
				entity: entity as EcsEntity<typeof behaviorComponent | any>,
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

async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter((entity): entity is BehavingEntity => behaviorComponent.test(entity))
				.map((entity) => attachSystemToEntity(game, entity)),
		);
	});
}

export const behaviorTreeSystem = new EcsSystem([behaviorComponent], attachSystem);
