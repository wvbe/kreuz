import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { PersonEntity } from './PersonEntity.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../generators/generateGridTerrainFromAscii.ts';
import { Terrain } from '../terrain/Terrain.ts';
import { Need } from './Need.ts';

describe('Need', () => {
	describe('In isolation', () => {
		const game = new Game('test', new Terrain(0, []), []);
		const need = new Need(1, 'test', 1 / 100);
		const onBetween1 = mock.fn();
		need.onceBetween(0, 0.3, onBetween1);
		const onBetween2 = mock.fn();
		need.onceBetween(0, 0.5, onBetween2);
		need.attach(game);

		const onNeedSet = mock.fn();
		need.on(onNeedSet);

		it('Does not tick before the game starts', () => {
			expect(onNeedSet).toHaveBeenCalledTimes(0);
			expect(need.get()).toBe(1);
			game.time.step();
			expect(onNeedSet).toHaveBeenCalledTimes(0);
			// expect(need.get()).toBeLessThan(1);
		});

		it('Registers a timer for the onBetween ranges that are listened to', () => {
			expect(onBetween1).toHaveBeenCalledTimes(0);
			expect(onBetween2).toHaveBeenCalledTimes(0);
			expect(onNeedSet).toHaveBeenCalledTimes(0);
			game.time.step();
			expect(onNeedSet).toHaveBeenCalledTimes(0);
			game.time.jump();
			expect(onNeedSet).toHaveBeenCalledTimes(1);
			expect(onBetween1).toHaveBeenCalledTimes(0);
			expect(onBetween2).toHaveBeenCalledTimes(1);
			expect(need.get()).toBe(0.5);
			expect(game.time.now).toBe(50);
			game.time.jump();
			expect(onBetween1).toHaveBeenCalledTimes(1);
			expect(onNeedSet).toHaveBeenCalledTimes(2);
			expect(need.get()).toBe(0.3);
			expect(game.time.now).toBe(69);
		});

		it('Registers a timer if new onBetween ranges are listened to after attaching', () => {
			const onBetween3 = mock.fn();
			need.onceBetween(0, 0.2, onBetween3);
			expect(onNeedSet).toHaveBeenCalledTimes(2);
			game.time.jump();
			expect(onNeedSet).toHaveBeenCalledTimes(3);
			expect(onBetween3).toHaveBeenCalledTimes(1);
		});
	});
	describe('In context of a full game', () => {
		const terrain = generateGridTerrainFromAscii(`X`);
		const entity = new PersonEntity('test', terrain.getTileClosestToXy(0, 0));
		const game = new Game('test', terrain, [entity]);

		const onTime = mock.fn();
		const onNeed = mock.fn();
		const onFoodNeed = mock.fn();

		game.time.on(onTime);
		entity.needs.food.on(onFoodNeed);
		Object.keys(entity.needs).forEach((key) =>
			entity.needs[key as keyof typeof entity.needs].on(onNeed),
		);

		new TestDriver().attach(game).start();

		it('Needs are actually depleted', () => {
			expect(
				Object.keys(entity.needs)
					.map((key) => entity.needs[key as keyof typeof entity.needs].get())
					.every((need) => need === 0),
			).toBeTruthy();
		});

		it('It takes 1.000.000 time for all needs to deplete', () => {
			// Game stops after all timers ran out, which in this case is that of the slowest decaying
			// need:
			expect(game.time.now).toBe(1000_000);
		});

		it('All needs emitted an event once', () => {
			expect(onFoodNeed).toHaveBeenCalledTimes(1);

			expect(onNeed).toHaveBeenCalledTimes(Object.keys(entity.needs).length);
		});

		it('Needs expire with a minimal amount of actual ticks', () => {
			// There are 5 unique decay speeds across the needs, so to expire all of them we've jumped
			// to 5 different points in time.
			expect(onTime).toHaveBeenCalledTimes(5);
		});
	});
});

run();
