import Game from '../../Game.ts';
import { Event } from '../../events/Event.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { needsComponent } from '../components/needsComponent.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { EcsEntity } from '../types.ts';
import { statusComponent } from '../components/statusComponent.ts';

const dyingSpeed = 1 / 1_000_000;

async function attachSystemToEntity(game: Game, person: EcsEntity) {
	const health = (person as EcsEntity<typeof healthComponent>).$health;
	const needs = (person as EcsEntity<typeof needsComponent>).needs;
	const death = new Event('death');

	health.attach(game);

	health.onceBelow(
		0,
		() => {
			health.detach();
			health.setDelta(0);
			death.emit();
		},
		true,
	);

	for (const need of Object.values(needs)) {
		await need.attach(game);
		// A "need" starts being detrimental to ones health when it is less than 10% satisfied
		const stop1 = need.onBelow(0.1, () => {
			const delta = health.delta - dyingSpeed;
			health.setDelta(delta);
		});
		// When the need is satisfied 10% or more again, the detrimental effect on health is removed.
		// @TODO This is probably buggy for entities starting life with some needs set to less than
		// 10%, but no detrimental health delta.
		const stop2 = need.onAbove(
			0.1,
			() => {
				const delta = health.delta + dyingSpeed;
				health.setDelta(delta);
			},
			true,
		);

		death.once(() => {
			stop1();
			stop2();
			need.detach();
		});
	}
	death.once(() => {
		if (statusComponent.test(person)) {
			(person as EcsEntity<typeof statusComponent>).$status.set('Died of natural causes.');
		}
	});
}

export const healthSystem = new EcsSystem([healthComponent, needsComponent], async (game) => {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter((entity) => healthComponent.test(entity) && needsComponent.test(entity))
				.map((entity) => attachSystemToEntity(game, entity)),
		);
	});
});
