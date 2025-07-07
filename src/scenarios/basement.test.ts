import { personArchetype } from '../lib/level-1/ecs/archetypes/personArchetype';
import { EcsArchetypeEntity } from '../lib/level-1/ecs/types';
import Game from '../lib/level-1/Game';
import { TestDriver } from '../lib/test/TestDriver';
import createBasementDemo from './basement';

describe('"The basement"', () => {
	let driver: TestDriver, game: Game, melanie: EcsArchetypeEntity<typeof personArchetype>;

	beforeAll(async () => {
		driver = new TestDriver();
		game = await createBasementDemo(driver);
		melanie = game.entities.find((entity) =>
			personArchetype.test(entity),
		) as EcsArchetypeEntity<typeof personArchetype>;
	});

	it('Melanie is called Melanie, and she has needs', () => {
		expect(melanie.name).toBe('Rowbot');
		Object.values(melanie.needs).forEach((need) => {
			expect(need.get()).toBeGreaterThan(0);
		});
	});

	it('The game finishes by itself', async () => {
		await driver.startUntilStop();

		expect(game.time.now).toBeGreaterThan(116000);
		expect(melanie.health.get()).toBe(0);

		expect(game.time.hasNextEvent()).toBeFalsy();
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});
