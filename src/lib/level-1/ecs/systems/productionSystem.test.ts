import { expect } from '@jest/globals';
import { createJobWorkBehavior } from '../../../level-2/behavior/reusable/nodes/createJobWorkBehavior';
import { growWheat } from '../../../level-2/blueprints';
import { wheat } from '../../../level-2/materials';
import { generateEmptyGame } from '../../../test/generateEmptyGame';
import { factoryArchetype } from '../archetypes/factoryArchetype';
import { personArchetype } from '../archetypes/personArchetype';
import { EcsArchetypeEntity } from '../types';

describe('System: productionSystem', () => {
	const { game, initGame } = generateEmptyGame();
	let worker: EcsArchetypeEntity<typeof personArchetype>;
	let factory: EcsArchetypeEntity<typeof factoryArchetype>;

	beforeAll(async () => {
		await initGame();
		worker = personArchetype.create({
			location: [0, 0, 1],
			icon: '🤖',
			name: 'R-bot',
			behavior: createJobWorkBehavior(),
		});
		factory = factoryArchetype.create({
			location: [3, 0, 1],
			owner: worker,
			blueprint: growWheat,
			maxStackSpace: 1,
			maxWorkers: 1,
		});

		await game.entities.add(worker);
		await game.entities.add(factory);
	});

	describe('Opening scenario', () => {
		it('Time is zero', () => {
			expect(game.time.now).toBe(0);
		});
		it('Worker is in their starting position', () => {
			expect(worker.location.get()).toEqual([0, 0, 1]);
		});
		it('Factory does not have workers', () => {
			expect(factory.$workers.length).toBe(0);
		});
		it('There is a job posting', () => {
			expect(game.jobs.globalJobCount).toBe(1);
		});
	});

	describe('When the worker arrives', () => {
		// This shoulda been done after t=3000
		beforeAll(async () => {
			await game.time.steps(3004);
		});
		it('Time is just over 3000', () => {
			expect(game.time.now).toBe(3004);
		});
		it('Person is physically at the factory', () => {
			expect(worker.location.get()).toEqual(factory.location.get());
		});
		it('Factory does have workers', () => {
			expect(factory.$workers.length).toBe(1);
		});
		it('Factory not have progress, but is gonna make it', () => {
			expect(factory.$$progress.get()).toBe(0);
			expect(factory.$$progress.delta).toBe(1 / growWheat.options.fullTimeEquivalent);
		});
		it('Factory has no produce yet', () => {
			expect(factory.inventory.availableOf(wheat)).toBe(0);
		});
	});

	describe('When the worker has been around for a bit', () => {
		beforeAll(async () => {
			await game.time.steps(500);
		});
		it('Time is just over 3500', () => {
			expect(game.time.now).toBe(3504);
		});
		it('Factory has made the expected amount of progress', () => {
			const delta = 1 / growWheat.options.fullTimeEquivalent;
			expect(factory.$$progress.delta).toBe(delta);
			expect(factory.$$progress.get()).toBe(500 * delta);
		});
		it("Still hasn't produced yet", () => {
			expect(factory.inventory.availableOf(wheat)).toBe(0);
		});
	});

	describe('When the worker has been around long enough for 1 production cycle', () => {
		beforeAll(async () => {
			await game.time.steps(16496);
		});
		it('Time is at 20000', () => {
			expect(game.time.now).toBe(20_000);
		});
		it('Factory produced a thing', () => {
			expect(factory.inventory.availableOf(wheat)).toBe(1);
		});
		it('Factory has stopped', () => {
			expect(factory.$workers.length).toBe(1);
			expect(factory.$$progress.delta).toBeGreaterThan(0);
			expect(factory.$$progress.get()).toBe(0.6900000000000004);
		});
	});

	describe('When the worker has been around long enough for 1 production cycle', () => {
		beforeAll(async () => {
			await game.time.steps(10_000);
		});
		it('Time is at 20000', () => {
			expect(game.time.now).toBe(30_000);
		});
		it('Factory produced another thing', () => {
			expect(factory.inventory.availableOf(wheat)).toBe(2);
		});
	});
});
