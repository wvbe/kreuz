import { expect } from '@jest/globals';
import { createJobWorkBehavior } from '../../../assets/behavior/execution/createJobWorkBehavior';

import { generateEmptyGame } from '../../../test/generateEmptyGame';
import { Material } from '../../inventory/Material';
import { MaterialState } from '../../inventory/types';
import { QualifiedCoordinate } from '../../terrain/types';
import { personArchetype } from '../archetypes/personArchetype';
import { eventLogComponent } from '../components/eventLogComponent';
import { importExportComponent } from '../components/importExportComponent';
import { inventoryComponent } from '../components/inventoryComponent';
import { locationComponent } from '../components/locationComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { EcsEntity } from '../types';

const wheat = new Material('Wheat', {
	symbol: 'WH',
	stackSize: 100,
	value: 0.1,
});

function createChestEntity(
	location: QualifiedCoordinate,
	requestMaterialsWhenBelow: MaterialState[],
	provideMaterialsWhenAbove: MaterialState[],
) {
	const entity = { id: 'chest-' + location.join('/') };
	inventoryComponent.attach(entity, { maxStackSpace: Infinity });
	locationComponent.attach(entity, { location });
	importExportComponent.attach(entity, {
		provideMaterialsWhenAbove,
		requestMaterialsWhenBelow,
	});
	visibilityComponent.attach(entity, { icon: '📦', name: entity.id });
	return entity as EcsEntity<
		typeof inventoryComponent | typeof locationComponent | typeof importExportComponent
	>;
}

function getLastEventLog(entity: EcsEntity<typeof eventLogComponent>) {
	return entity.events.slice(-1)[0];
}

describe('System: logisticsSystem', () => {
	const { game, initGame } = generateEmptyGame();
	let worker: ReturnType<typeof personArchetype.create>;
	let providerChest: ReturnType<typeof createChestEntity>;
	let requesterChest: ReturnType<typeof createChestEntity>;

	beforeAll(async () => {
		await initGame();
		worker = personArchetype.create({
			location: [game.terrain, 0, 0, 1],
			icon: '🤖',
			name: 'R-bot',
			behavior: createJobWorkBehavior(),
		});
		await game.entities.add(worker);

		providerChest = createChestEntity(
			[game.terrain, 2, 2, 1],
			[],
			[{ material: wheat, quantity: 100 }],
		);
		await game.entities.add(providerChest);

		requesterChest = createChestEntity(
			[game.terrain, 2, 0, 1],
			[{ material: wheat, quantity: 1000 }],
			[],
		);
		await game.entities.add(requesterChest);

		await providerChest.inventory.change(wheat, 1000);
	});

	describe('Opening scenario', () => {
		it('Time is zero', () => {
			expect(game.time.now).toBe(0);
		});
		it('Person is in their starting position', () => {
			expect(worker.location.get()).toEqual([game.terrain, 0, 0, 1]);
		});
		it('There is a job posting', () => {
			expect(game.jobs.globalJobCount).toBe(0);
		});
		it('Checking all the inventory numbers', () => {
			expect(providerChest.inventory.availableOf(wheat)).toBe(1000);
			expect(providerChest.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(providerChest.inventory.reservedOutgoingOf(wheat)).toBe(0);

			expect(requesterChest.inventory.availableOf(wheat)).toBe(0);
			expect(requesterChest.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(requesterChest.inventory.reservedOutgoingOf(wheat)).toBe(0);

			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		});
	});

	describe('When the timeout before a transport job is posted has not expired', () => {
		it('Person is still in their starting position', async () => {
			await game.time.steps(9_000);
			expect(game.time.now).toBe(9_000);
			expect(worker.location.get()).toEqual([game.terrain, 0, 0, 1]);
		});
		it('There is a job posting', () => {
			expect(game.jobs.globalJobCount).toBe(0);
		});
	});

	describe('As soon as the transport job is posted, the worker takes it', () => {
		it('Person is still in their starting position', async () => {
			await game.time.steps(1_001);
			expect(game.time.now).toBe(10_001);
			expect(worker.location.get()).toEqual([game.terrain, 0, 0, 1]);
		});
		it('Worker has a status update', () => {
			expect(getLastEventLog(worker)).toBe(
				'Going to #{entity:chest-world-surface/2/2/1} for a hauling job',
			);
		});

		it('Checking all the inventory numbers', () => {
			expect(providerChest.inventory.availableOf(wheat)).toBe(100);
			expect(providerChest.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(providerChest.inventory.reservedOutgoingOf(wheat)).toBe(900);

			expect(requesterChest.inventory.availableOf(wheat)).toBe(0);
			expect(requesterChest.inventory.reservedIncomingOf(wheat)).toBe(900);
			expect(requesterChest.inventory.reservedOutgoingOf(wheat)).toBe(0);

			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		});

		it('There are 8 remaining job postings', () => {
			// One job to transport another 100 wheat
			expect(game.jobs.globalJobCount).toBe(8);
		});
	});

	describe('When the worker arrives at the pick-up location', () => {
		it('Person location is same as provider chest', async () => {
			await game.time.steps(4_001);
			expect(game.time.now).toBe(14_002);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);

			// nb ⚡️; the test process will hang if we don't slice() the qualified coordinates
			expect(worker.location.get().slice(1)).toEqual(providerChest.location.get().slice(1));
		});
		it('Checking all the inventory numbers', () => {
			expect(providerChest.inventory.availableOf(wheat)).toBe(100);
			expect(providerChest.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(providerChest.inventory.reservedOutgoingOf(wheat)).toBe(800);

			expect(requesterChest.inventory.availableOf(wheat)).toBe(0);
			expect(requesterChest.inventory.reservedIncomingOf(wheat)).toBe(900);
			expect(requesterChest.inventory.reservedOutgoingOf(wheat)).toBe(0);

			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		});
		it('Worker has a status update', () => {
			expect(getLastEventLog(worker)).toBe(
				'Loading 100 of WH Wheat from #{entity:chest-world-surface/2/2/1} for transport to #{entity:chest-world-surface/2/0/1}',
			);
		});
	});

	describe('When the worker leaves the pick-up location', () => {
		it('Worker has a status update', async () => {
			await game.time.steps(1_001);
			expect(game.time.now).toBe(15_003);
			expect(getLastEventLog(worker)).toBe(
				'Delivering cargo to #{entity:chest-world-surface/2/0/1}',
			);
		});
		it('Checking all the inventory numbers', () => {
			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(100);
		});
	});

	describe('When the worker arrives at the drop-off location', () => {
		it('Worker has a status update', async () => {
			await game.time.steps(2_000);
			expect(game.time.now).toBe(17_003);
			expect(getLastEventLog(worker)).toBe(
				'Unloading cargo to #{entity:chest-world-surface/2/0/1}',
			);
		});
		it('Worker no longer hanging on to the cargo', () => {
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		});
		it('Checking all the inventory numbers', () => {
			expect(providerChest.inventory.availableOf(wheat)).toBe(100);
			expect(providerChest.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(providerChest.inventory.reservedOutgoingOf(wheat)).toBe(800);

			expect(requesterChest.inventory.availableOf(wheat)).toBe(0);
			expect(requesterChest.inventory.reservedIncomingOf(wheat)).toBe(900);
			expect(requesterChest.inventory.reservedOutgoingOf(wheat)).toBe(0);

			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		});
	});

	describe('When the cargo transfer is complete', () => {
		it('Requester has received all', async () => {
			await game.time.steps(1_002);
			expect(game.time.now).toBe(18_005);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(requesterChest.inventory.availableOf(wheat)).toBe(100);
		});

		it('Checking all the inventory numbers', () => {
			expect(providerChest.inventory.availableOf(wheat)).toBe(100);
			expect(providerChest.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(providerChest.inventory.reservedOutgoingOf(wheat)).toBe(800);

			expect(requesterChest.inventory.availableOf(wheat)).toBe(100);
			expect(requesterChest.inventory.reservedIncomingOf(wheat)).toBe(800);
			expect(requesterChest.inventory.reservedOutgoingOf(wheat)).toBe(0);

			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		});
	});

	// TODO actually finish test yooo
});
