import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { loiterNode } from './loiterNode.ts';

describe('BT: loiterNode', () => {
	const pathStart = mock.fn();
	const pathEnd = mock.fn();
	const game = new Game(
		'1',
		generateGridTerrainFromAscii(`
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXXXXX
		`),
	);
	new TestDriver().attach(game);

	const entity = new PersonEntity('person-1', game.terrain.getTileClosestToXy(3, 3));
	game.entities.add(entity);

	entity.$pathStart.on(pathStart);
	entity.$pathEnd.on(pathEnd);
	entity.$behavior.set(loiterNode);

	it('t=5.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(5_000);
		expect(pathStart).toHaveBeenCalledTimes(1);
		expect(pathEnd).toHaveBeenCalledTimes(0);
	});

	it('t=10.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(10_000);
		expect(pathStart).toHaveBeenCalledTimes(1);
		expect(pathEnd).toHaveBeenCalledTimes(1);
	});

	it('t=15.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(15_000);
		expect(pathStart).toHaveBeenCalledTimes(2);
		expect(pathEnd).toHaveBeenCalledTimes(1);
	});

	it('t=20.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(20_000);
		expect(pathStart).toHaveBeenCalledTimes(2);
		expect(pathEnd).toHaveBeenCalledTimes(2);
	});

	it('t=25.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(25_000);
		expect(pathStart).toHaveBeenCalledTimes(2);
		expect(pathEnd).toHaveBeenCalledTimes(2);
	});

	it('t=30.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(30_000);
		expect(pathStart).toHaveBeenCalledTimes(3);
		expect(pathEnd).toHaveBeenCalledTimes(2);
	});

	it('t=35.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(35_000);
		expect(pathStart).toHaveBeenCalledTimes(3);
		expect(pathEnd).toHaveBeenCalledTimes(2);
	});

	it('t=40.000', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(40_000);
		expect(pathStart).toHaveBeenCalledTimes(3);
		expect(pathEnd).toHaveBeenCalledTimes(3);
	});

	it('t=500.000', () => {
		game.time.steps(460_000);
		expect(game.time.now).toBe(500_000);
		expect(pathStart).toHaveBeenCalledTimes(3);
		expect(pathEnd).toHaveBeenCalledTimes(3);
	});
});

run();
