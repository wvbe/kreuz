import { expect } from '@jest/globals';
import { generateEmptyGame } from 'src/lib/test/generateEmptyGame';
import { createJobWorkBehavior } from '../../../level-2/behavior/reusable/nodes/createJobWorkBehavior';
import { growWheat } from '../../../level-2/blueprints';
import { wheat } from '../../../level-2/materials';
import { factoryArchetype } from '../archetypes/factoryArchetype';
import { personArchetype } from '../archetypes/personArchetype';

describe('System: productionSystem', () => {
	const game = await generateEmptyGame();
	const worker = personArchetype.create({
		location: [0, 0, 1],
		icon: '🤖',
		name: 'R-bot',
		behavior: createJobWorkBehavior(),
	});
	const factory = factoryArchetype.create({
		location: [3, 0, 1],
		owner: worker,
		blueprint: growWheat,
		maxStackSpace: 1,
		maxWorkers: 1,
	});

	await game.entities.add(worker);
	await game.entities.add(factory);

	it('Opening scenario', async (test) => {
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

	it('When the worker arrives', async (test) => {
		// This shoulda been done after t=3000
		await game.time.steps(3004);
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

	it('When the worker has been around for a bit', async (test) => {
		await game.time.steps(500);
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

	it('When the worker has been around long enough for 1 production cycle', async (test) => {
		await game.time.steps(16496);
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

	it('When the worker has been around long enough for 1 production cycle', async (test) => {
		await game.time.steps(10_000);
		it('Time is at 20000', () => {
			expect(game.time.now).toBe(30_000);
		});
		it('Factory produced another thing', () => {
			expect(factory.inventory.availableOf(wheat)).toBe(2);
		});
	});
});
