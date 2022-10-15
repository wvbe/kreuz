import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { PersonEntity } from './PersonEntity.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { Terrain } from '../terrain/Terrain.ts';
import { Need } from './Need.ts';

describe('Need', () => {
	it('.setDecay()', () => {
		const game = new Game('test', new Terrain(0, []), []);
		const need = new Need(1, 'test', 1 / 1000);
		need.attach(game);
		const onBetween = mock.fn();
		need.onBetween(0, 0.1, onBetween);

		//    First timer wait to expire = (1000 * 0.9) = 900

		game.time.steps(750);
		expect(onBetween).toHaveBeenCalledTimes(0);

		//    Time left on timer = firstTimerWaitToExpire - 750   = 150

		need.setDecay(1 / 2000);

		// Decay at half the speed, so double the remaining timer
		//    New time left on timer = time left on timer * 2     = 300

		game.time.steps(299);
		expect(onBetween).toHaveBeenCalledTimes(0);
		game.time.steps(1);
		expect(onBetween).toHaveBeenCalledTimes(1);
	});

	it('.setPollingInterval()', () => {
		const game = new Game('test', new Terrain(0, []), []);
		const need = new Need(1, 'test', 1 / 1000);
		const onUpdate = mock.fn();
		const onBetween = mock.fn();

		need.on(onUpdate);
		need.onBetween(0, 0.8, onBetween);
		need.attach(game);
		game.time.steps(100);
		expect(onUpdate).toHaveBeenCalledTimes(0);
		expect(need.get()).toBe(1);
		expect(onBetween).toHaveBeenCalledTimes(0);

		const pollSpeed = 15;
		const stepsWhilePolling = 105;
		const destroy = need.setPollingInterval(pollSpeed);
		game.time.steps(stepsWhilePolling);
		expect(onUpdate).toHaveBeenCalledTimes(1 + Math.floor(stepsWhilePolling / pollSpeed) + 1);
		expect(onBetween).toHaveBeenCalledTimes(1);
		// expect(need.get()).toBe(0.6749999999999998);

		destroy();
		game.time.steps(100);
		expect(onUpdate).toHaveBeenCalledTimes(1 + Math.floor(stepsWhilePolling / pollSpeed) + 1 + 1);
	});
	it('will not keep listening if the need is already zero', () => {
		const game = new Game('test', new Terrain(0, []), []);
		const need = new Need(1, 'test', 1 / 4);
		need.attach(game);
		need.onBetween(0, 0.5, () => {});
		expect(game.time.now).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(2);
		game.time.jump();
		expect(game.time.now).toBe(2);
		expect(need.get()).toBe(0.5);
		game.time.jump();
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
	describe('In isolation', () => {
		const game = new Game('test', new Terrain(0, []), []);
		const need = new Need(1, 'test', 1 / 100);
		const onBetween1 = mock.fn();
		need.onceBetween(0, 0.3, onBetween1, { min: true, max: true });
		const onBetween2 = mock.fn();
		need.onceBetween(0, 0.5, onBetween2, { min: true, max: true });
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
			need.onceBetween(0, 0.2, onBetween3, { min: true, max: true });
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
			console.log(entity.needs);
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
