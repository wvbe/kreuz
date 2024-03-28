import Game from '../../Game.ts';
import { Event } from '../../events/Event.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { needsComponent } from '../components/needsComponent.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { EcsEntity } from '../types.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';

/**
 * The amount of health deducted per tick, per need that is less than 10% satisfied.
 */
const dyingSpeed = 1 / 1_000_000;

/**
 * The entity type to which this system applies.
 */
type HealthSystemEntity = EcsEntity<typeof healthComponent | typeof needsComponent>;

/**
 * Attaches the health system to an entity.
 */
async function attachSystemToEntity(game: Game, entity: HealthSystemEntity) {
	entity.$health.attach(game);

	entity.$health.onceBelow(
		0,
		() => {
			entity.$health.detach();
			entity.$health.setDelta(0);
			entity.$death.emit();
		},
		true,
	);

	for (const need of Object.values(entity.needs)) {
		await need.attach(game);
		// A "need" starts being detrimental to ones health when it is less than 10% satisfied
		const stop1 = need.onBelow(0.1, () => {
			const delta = entity.$health.delta - dyingSpeed;
			entity.$health.setDelta(delta);
		});
		// When the need is satisfied 10% or more again, the detrimental effect on health is removed.
		// @TODO This is probably buggy for entities starting life with some needs set to less than
		// 10%, but no detrimental health delta.
		const stop2 = need.onAbove(
			0.1,
			() => {
				const delta = entity.$health.delta + dyingSpeed;
				entity.$health.setDelta(delta);
			},
			true,
		);

		entity.$death.once(() => {
			stop1();
			stop2();
			need.detach();
		});
	}
	entity.$death.once(() => {
		if (statusComponent.test(entity)) {
			entity.$status.push('Died of natural causes.');
		}
		if (visibilityComponent.test(entity)) {
			entity.icon = '💀';
		}
	});
}

/**
 * The health system. It updates an entity's health component, and lowers it while the entity needs
 * are low. When the health reaches 0, the entity dies by emitting its $death event.
 *
 * @note Other systems, who depend on living entities, should listen for $death events.
 */
export const healthSystem = new EcsSystem([healthComponent, needsComponent], async (game) => {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is HealthSystemEntity =>
						healthComponent.test(entity) && needsComponent.test(entity),
				)
				.map((entity) => attachSystemToEntity(game, entity)),
		);
	});
});
