import Game from '../Game.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { EntityI } from '../entities/types.ts';
import { ProgressingNumericValue } from '../events/ProgressingNumericValue.ts';

const dyingSpeed = 1 / 1_000_000;

type HealthfulEntity = EntityI & {
	$health: ProgressingNumericValue;
	needs: PersonEntity['needs'];
};

function attachSystemToEntity(game: Game, person: HealthfulEntity) {
	person.$health.attach(game);
	person.needs.forEach((need) => {
		need.onBelow(0.1, () => {
			const delta = person.$health.delta - dyingSpeed;
			person.$health.setDelta(delta);
		});
		need.onAbove(
			0.1,
			() => {
				const delta = person.$health.delta + dyingSpeed;
				person.$health.setDelta(delta);
			},
			true,
		);
	});
	person.$health.onceBelow(
		0,
		() => {
			person.$health.detach();
			person.$health.setDelta(0);
		},
		true,
	);
}
export async function attachSystem(game: Game) {
	game.entities.$add.on((entities) => {
		entities
			.filter(
				(entity): entity is HealthfulEntity =>
					(entity as PersonEntity).$health instanceof ProgressingNumericValue &&
					Array.isArray((entity as PersonEntity).needs),
			)
			.forEach((person) => attachSystemToEntity(game, person));
	});
}
