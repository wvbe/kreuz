import { EntityI } from '../entities/types.ts';
import { type Inventory } from '../inventory/Inventory.ts';
import { type MaterialState } from '../inventory/types.ts';
import { EventedValue } from './EventedValue.ts';

type TradeOrderJson = {
	inventory1: Inventory;
	inventory2: Inventory;
	money1: number;
	money2: number;
	owner1: TradeEntityI;
	owner2: TradeEntityI;
	stacks1: MaterialState[];
	stacks2: MaterialState[];
};

export enum TradeFailReason {
	NO_MONEY_1 = 'Buyer has no money',
	NO_MONEY_2 = 'Seller has no money',
	NO_MATERIAL_1 = 'Buyer has no materials',
	NO_MATERIAL_2 = 'Seller has no materials',
	NO_SPACE_1 = 'Buyer has no available space',
	NO_SPACE_2 = 'Seller has no available space',
}

type TradeFailReasonMessage = [TradeFailReason, ...any];

interface TradeEntityI extends EntityI {
	wallet: EventedValue<number>;
}

type TradeOrderConstructorParam = {
	owner: TradeEntityI;
	inventory: Inventory;
	money: number;
	cargo: MaterialState[];
};
export class TradeOrder {
	#order: TradeOrderJson;

	constructor(a: TradeOrderConstructorParam, b: TradeOrderConstructorParam) {
		this.#order = {
			owner1: a.owner,
			inventory1: a.inventory,
			money1: a.money,
			stacks1: a.cargo,

			owner2: b.owner,
			inventory2: b.inventory,
			money2: b.money,
			stacks2: b.cargo,
		};
	}

	public findFailReasons(): TradeFailReasonMessage[] {
		const reasons: TradeFailReasonMessage[] = [];
		const { inventory1, inventory2, money1, money2, owner1, owner2, stacks1, stacks2 } =
			this.#order;

		if (owner1.wallet.get() < money1) {
			reasons.push([TradeFailReason.NO_MONEY_1, owner1, money1]);
		}

		if (owner2.wallet.get() < money2) {
			reasons.push([TradeFailReason.NO_MONEY_2, owner2, money2]);
		}

		reasons.push(
			...stacks1
				.filter(({ material, quantity }) => inventory1.availableOf(material) < quantity)
				.map<TradeFailReasonMessage>(({ material }) => [
					TradeFailReason.NO_MATERIAL_1,
					owner1,
					material,
				]),
		);
		reasons.push(
			...stacks2
				.filter(({ material, quantity }) => inventory2.availableOf(material) < quantity)
				.map<TradeFailReasonMessage>(({ material }) => [
					TradeFailReason.NO_MATERIAL_2,
					owner2,
					material,
				]),
		);

		if (!inventory1.isEverythingAllocatable(stacks2)) {
			reasons.push([TradeFailReason.NO_SPACE_1, owner1]);
		}

		if (!inventory2.isEverythingAllocatable(stacks1)) {
			reasons.push([TradeFailReason.NO_SPACE_2, owner2]);
		}

		return reasons;
	}

	/**
	 * Returns the plussed and minussed items for each party. Returns an array with two lists:
	 * - Items added and removed from inventory1 if the deal were to complete
	 * - Items added and removed from inventory2 if the deal were to complete
	 */
	public getCargoExchanged(): [MaterialState[], MaterialState[]] {
		const { stacks1, stacks2 } = this.#order;
		return [...stacks1, ...stacks2]
			.map(({ material }) => material)
			.filter((m, i, a) => a.indexOf(m) === i)
			.reduce<[MaterialState[], MaterialState[]]>(
				([transfer1, transfer2], mat) => {
					const offer1 = stacks1.find(({ material }) => material === mat)?.quantity || 0;
					const offer2 = stacks2.find(({ material }) => material === mat)?.quantity || 0;
					const owedToOwner2 = offer1 - offer2;
					if (owedToOwner2 !== 0) {
						const sender = owedToOwner2 > 0 ? transfer1 : transfer2;
						const receiver = owedToOwner2 > 0 ? transfer2 : transfer1;
						sender.push({ material: mat, quantity: -Math.abs(owedToOwner2) });
						receiver.push({ material: mat, quantity: Math.abs(owedToOwner2) });
					}
					return [transfer1, transfer2];
				},
				[[], []],
			);
	}

	public getCargoExchangedToInventory(inventory: Inventory): MaterialState[] {
		if (inventory === this.#order.inventory1) {
			return this.getCargoExchanged()[0];
		}
		if (inventory === this.#order.inventory2) {
			return this.getCargoExchanged()[1];
		}
		throw new Error(`This inventory is not party to the trade order`);
	}

	public makeItHappen(): void {
		const failReasons = this.findFailReasons();
		if (failReasons.length) {
			throw new Error(`Deal invalid:\n\t${failReasons.join('\n\t')}`);
		}

		const { inventory1, inventory2, money1, money2, owner1, owner2, stacks1, stacks2 } =
			this.#order;

		// Pay money
		const owedToOwner2 = money1 - money2;
		if (owedToOwner2 !== 0) {
			const sender = owedToOwner2 > 0 ? owner1 : owner2;
			const receiver = owedToOwner2 > 0 ? owner2 : owner1;
			sender.wallet.set(sender.wallet.get() - Math.abs(owedToOwner2));
			receiver.wallet.set(receiver.wallet.get() + Math.abs(owedToOwner2));
		}

		// Transfer inventory items
		const [transfer1, transfer2] = this.getCargoExchanged();
		inventory1.changeMultiple(transfer1);
		inventory2.changeMultiple(transfer2);

		console.log(
			`${owner1} and ${owner2} have made a trade:
  ${owner1} paying 💰${money1} and ${
				stacks1.length ? stacks1.map((s) => `${s.quantity}x${s.material}`).join(', ') : 'no cargo'
			}
  ${owner2} paying 💰${money2} and ${
				stacks2.length ? stacks2.map((s) => `${s.quantity}x${s.material}`).join(', ') : 'no cargo'
			}`,
		);
	}
}
