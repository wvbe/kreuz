import { describe, expect, it, run, beforeAll } from 'tincan';

import { FactoryBuildingEntity, PersonEntity, SettlementEntity, TestDriver, Game } from '@lib';
import createGeneratorDemo from './main.ts';

describe('Default generator', async () => {
	let game: Game;
	beforeAll(async () => {
		game = await createGeneratorDemo(new TestDriver());
		// new TestDriver().attach(game);
	});

	it('Has several entities of various types', () => {
		expect(game.entities.filter((e) => e instanceof PersonEntity).length).toBeGreaterThanOrEqual(
			12,
		);
		expect(
			game.entities.filter((e) => e instanceof SettlementEntity).length,
		).toBeGreaterThanOrEqual(3);
		expect(
			game.entities.filter((e) => e instanceof FactoryBuildingEntity).length,
		).toBeGreaterThanOrEqual(6);
	});
});

run();
