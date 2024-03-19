import { describe, expect, it, run } from '@test';
import { Material } from '../inventory/Material.ts';
import { Coordinate } from '../terrain/Coordinate.ts';
import { TradeFailReason, TradeOrder } from './TradeOrder.ts';
import { personArchetype } from '@lib';

const material1 = new Material('alpha', { stackSize: 10, symbol: 'a' });
const material2 = new Material('beta', { stackSize: 10, symbol: 'b' });

describe('TradeOrder', () => {
	describe('.findFailReasons()', () => {
		it('every fail possible', () => {
			const owner1 = personArchetype.create({
				location: [0, 0, Infinity],
				icon: '🤖',
				name: 'test A',
				behavior: null,
			});
			const owner2 = personArchetype.create({
				location: [0, 0, Infinity],
				icon: '🤖',
				name: 'test B',
				behavior: null,
			});
			const order = new TradeOrder(
				{
					owner: owner1,
					inventory: owner1.inventory,
					money: 50,
					cargo: [{ material: material1, quantity: 9999 }],
				},
				{
					owner: owner2,
					inventory: owner2.inventory,
					money: 50,
					cargo: [{ material: material2, quantity: 9999 }],
				},
			);
			expect(order.findFailReasons().map(([reason]) => reason)).toEqual([
				TradeFailReason.NO_MONEY_1,
				TradeFailReason.NO_MONEY_2,
				TradeFailReason.NO_MATERIAL_1,
				TradeFailReason.NO_MATERIAL_2,
				TradeFailReason.NO_SPACE_1,
				TradeFailReason.NO_SPACE_2,
			]);
		});
		it('no fails at all', async () => {
			const owner1 = personArchetype.create({
				location: [0, 0, Infinity],
				icon: '🤖',
				name: 'test A',
				behavior: null,
			});
			const owner2 = personArchetype.create({
				location: [0, 0, Infinity],
				icon: '🤖',
				name: 'test B',
				behavior: null,
			});
			await owner1.wallet.set(51);
			await owner1.inventory.change(material1, 10);
			await owner2.wallet.set(51);
			await owner2.inventory.change(material2, 10);
			const order = new TradeOrder(
				{
					owner: owner1,
					inventory: owner1.inventory,
					money: 50,
					cargo: [{ material: material1, quantity: 1 }],
				},
				{
					owner: owner2,
					inventory: owner2.inventory,
					money: 50,
					cargo: [{ material: material2, quantity: 1 }],
				},
			);
			expect(order.findFailReasons().map(([reason]) => reason)).toEqual([]);
		});
	});
	it('.makeItHappen()', async () => {
		const owner1 = personArchetype.create({
			location: [0, 0, Infinity],
			icon: '🤖',
			name: 'test A',
			behavior: null,
		});
		const owner2 = personArchetype.create({
			location: [0, 0, Infinity],
			icon: '🤖',
			name: 'test B',
			behavior: null,
		});
		owner1.wallet.set(50);
		await owner1.inventory.change(material1, 10);
		await owner1.inventory.change(material2, 10);
		owner2.wallet.set(50);
		await owner2.inventory.change(material1, 10);
		await owner2.inventory.change(material2, 10);
		const order = new TradeOrder(
			{
				owner: owner1,
				inventory: owner1.inventory,
				money: 33,
				cargo: [
					{ material: material1, quantity: 10 },
					{ material: material2, quantity: 3 },
				],
			},
			{
				owner: owner2,
				inventory: owner2.inventory,
				money: 25,
				cargo: [
					{ material: material1, quantity: 3 },
					{ material: material2, quantity: 10 },
				],
			},
		);

		await order.makeItHappen(0);

		// money was exchanged both ways
		expect(owner1.wallet.get()).toBe(42); // 50 - 33 + 25
		expect(owner2.wallet.get()).toBe(58); // 50 + 33 - 25

		// material1 was exchanged both ways
		expect(owner1.inventory.availableOf(material1)).toBe(3); // 10 - 10 + 3
		expect(owner2.inventory.availableOf(material1)).toBe(17); // 10 - 3 + 10

		// ⚠️
		expect(owner1.inventory.availableOf(material2)).toBe(17); // 10 - 3 + 10
		expect(owner2.inventory.availableOf(material2)).toBe(3); // 10 - 10 + 3
	});
	// });
});
run();
