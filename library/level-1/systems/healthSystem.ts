import Game from '../Game.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { EntityI } from '../entities/types.ts';
import { ProgressingNumericValue } from '../events/ProgressingNumericValue.ts';

const dyingSpeed = 1 / 1_000_000;

type HealthfulEntity = EntityI & {
	$health: ProgressingNumericValue;
	needs: PersonEntity['needs'];
};

async function attachSystemToEntity(game: Game, person: HealthfulEntity) {
	person.$health.attach(game);
	person.$health.onceBelow(
		0,
		() => {
			person.$health.detach();
			person.$health.setDelta(0);
		},
		true,
	);

	for (const need of person.needs) {
		await need.attach(game);
		// A "need" starts being detrimental to ones health when it is less than 10% satisfied
		need.onBelow(0.1, () => {
			const delta = person.$health.delta - dyingSpeed;
			person.$health.setDelta(delta);
		});
		// When the need is satisfied 10% or more again, the detrimental effect on health is removed.
		// @TODO This is probably buggy for entities starting life with some needs set to less than
		// 10%, but no detrimental health delta.
		need.onAbove(
			0.1,
			() => {
				const delta = person.$health.delta + dyingSpeed;
				person.$health.setDelta(delta);
			},
			true,
		);

		// @TODO
		// person.$detach.once(() => need.detach());

		// @TODO necessary?
		// person.$detach.once(() => this.needs.forEach((need) => need.clear()));
	}
}

export async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is HealthfulEntity =>
						(entity as PersonEntity).$health instanceof ProgressingNumericValue &&
						Array.isArray((entity as PersonEntity).needs),
				)
				.map((person) => attachSystemToEntity(game, person)),
		);
	});
}
