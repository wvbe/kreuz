import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { Material } from '../inventory/Material.ts';
import { Coordinate } from '../terrain/Coordinate.ts';
import { TradeFailReason, TradeOrder } from './TradeOrder.ts';

const material1 = new Material('alpha', { stackSize: 10, symbol: 'a' });
const material2 = new Material('beta', { stackSize: 10, symbol: 'b' });

describe('TradeOrder', () => {
	describe('.findFailReasons()', () => {
		it('every fail possible', () => {
			const owner1 = new PersonEntity('a', new Coordinate(0, 0, 0));
			const owner2 = new PersonEntity('b', new Coordinate(0, 0, 0));
			const order = new TradeOrder({
				owner1,
				inventory1: owner1.inventory,
				money1: 50,
				stacks1: [{ material: material1, quantity: 9999 }],
				owner2,
				inventory2: owner2.inventory,
				money2: 50,
				stacks2: [{ material: material2, quantity: 9999 }],
			});
			expect(order.findFailReasons().map(([reason]) => reason)).toEqual([
				TradeFailReason.NO_MONEY_1,
				TradeFailReason.NO_MONEY_2,
				TradeFailReason.NO_MATERIAL_1,
				TradeFailReason.NO_MATERIAL_2,
				TradeFailReason.NO_SPACE_1,
				TradeFailReason.NO_SPACE_2,
			]);
		});
		it('no fails at all', () => {
			const owner1 = new PersonEntity('a', new Coordinate(0, 0, 0));
			const owner2 = new PersonEntity('b', new Coordinate(0, 0, 0));
			owner1.wallet.set(51);
			owner1.inventory.change(material1, 10);
			owner2.wallet.set(51);
			owner2.inventory.change(material2, 10);
			const order = new TradeOrder({
				owner1,
				inventory1: owner1.inventory,
				money1: 50,
				stacks1: [{ material: material1, quantity: 1 }],
				owner2,
				inventory2: owner2.inventory,
				money2: 50,
				stacks2: [{ material: material2, quantity: 1 }],
			});
			expect(order.findFailReasons().map(([reason]) => reason)).toEqual([]);
		});
	});
});
run();
