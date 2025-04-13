import { expect } from '@jest/globals';
import { generateEmptyGame } from 'src/lib/test/generateEmptyGame';
import { createJobWorkBehavior } from '../../../level-2/behavior/reusable/nodes/createJobWorkBehavior';
import { wheat } from '../../../level-2/materials';
import { MaterialState } from '../../inventory/types';
import { SimpleCoordinate } from '../../terrain/types';
import { personArchetype } from '../archetypes/personArchetype';
import { eventLogComponent } from '../components/eventLogComponent';
import { importExportComponent } from '../components/importExportComponent';
import { inventoryComponent } from '../components/inventoryComponent';
import { locationComponent } from '../components/locationComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { EcsEntity } from '../types';

function createChestEntity(
	location: SimpleCoordinate,
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
	const game = await generateEmptyGame();
	const worker = personArchetype.create({
		location: [0, 0, 1],
		icon: '🤖',
		name: 'R-bot',
		behavior: createJobWorkBehavior(),
	});
	await game.entities.add(worker);

	const providerChest = createChestEntity([2, 2, 1], [], [{ material: wheat, quantity: 100 }]);
	await game.entities.add(providerChest);

	const requesterChest = createChestEntity([2, 0, 1], [{ material: wheat, quantity: 1000 }], []);
	await game.entities.add(requesterChest);

	await providerChest.inventory.change(wheat, 1000);

	// Useful to debug the timestamps for various actions:
	// getLastEventLog(worker)status) => console.log(`Updated status at t=${game.time.now}: ${status}`));

	it('Opening scenario', async (test) => {
		it('Time is zero', () => {
			expect(game.time.now).toBe(0);
		});
		it('Person is in their starting position', () => {
			expect(worker.location.get()).toEqual([0, 0, 1]);
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

	it('When the timeout before a transport job is posted has not expired', async (test) => {
		await game.time.steps(9_000);
		expect(game.time.now).toBe(9_000);
		it('Person is still in their starting position', () => {
			expect(worker.location.get()).toEqual([0, 0, 1]);
		});
		it('There is a job posting', () => {
			expect(game.jobs.globalJobCount).toBe(0);
		});
	});

	it('As soon as the transport job is posted, the worker takes it', async (test) => {
		await game.time.steps(1_000);
		expect(game.time.now).toBe(10_000);
		it('Person is still in their starting position', () => {
			expect(worker.location.get()).toEqual([0, 0, 1]);
		});
		it('Worker has a status update', () => {
			expect(getLastEventLog(worker)).toBe(
				'Going to #{entity:chest-2/2/1} for a hauling job',
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

	it('When the worker arrives at the pick-up location', async (test) => {
		await game.time.steps(4_001);
		expect(game.time.now).toBe(14_001);
		expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(0);
		it('Person location is same as provider chest', () => {
			expect(worker.location.get()).toEqual(providerChest.location.get());
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
				'Loading 100 of WH Wheat from #{entity:chest-2/2/1} for transport to #{entity:chest-2/0/1}',
			);
		});
	});

	it('When the worker leaves the pick-up location', async (test) => {
		await game.time.steps(1_001);
		expect(game.time.now).toBe(15_002);
		it('Worker has a status update', () => {
			expect(getLastEventLog(worker)).toBe('Delivering cargo to #{entity:chest-2/0/1}');
		});
		it('Checking all the inventory numbers', () => {
			expect(worker.inventory.availableOf(wheat)).toBe(0);
			expect(worker.inventory.reservedIncomingOf(wheat)).toBe(0);
			expect(worker.inventory.reservedOutgoingOf(wheat)).toBe(100);
		});
	});

	it('When the worker arrives at the drop-off location', async (test) => {
		await game.time.steps(2_000);
		expect(game.time.now).toBe(17_002);
		it('Worker has a status update', () => {
			expect(getLastEventLog(worker)).toBe('Unloading cargo to #{entity:chest-2/0/1}');
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

	it('When the cargo transfer is complete', async (test) => {
		await game.time.steps(1_002);
		expect(game.time.now).toBe(18_004);
		it('Requester has received all', () => {
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
