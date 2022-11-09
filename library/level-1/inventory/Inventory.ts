/**
 * @file
 * https://github.com/wvbe/experimental-factory-game/blob/master/src/classes/Inventory.ts
 */

import { Event } from '../classes/Event.ts';
import { TradeOrder } from '../classes/TradeOrder.ts';
import { type Material } from './Material.ts';
import { type MaterialState } from './types.ts';

function getRequiredStackSpace(cargo: MaterialState[]) {
	return cargo.reduce<number>(
		(amount, { material, quantity }) => amount + Math.ceil(quantity / material.stack),
		0,
	);
}

/**
 * An "inventory" is like a bunch of stacks that hold Materials. An inventory can be (un)restricted
 * to any amount of stacks, and any stack can be (any amount of) one material.
 *
 * @TODO use Map instead of Array
 * @TODO probably model a Stack class separately
 */
export class Inventory {
	/**
	 * @TODO refactor to WeakMap
	 */
	private readonly items: MaterialState[] = [];

	private readonly reservations = new Map<TradeOrder, MaterialState[]>();

	/**
	 * The event that the inventory contents changes -- such as new items being added, removed,
	 * reserved or expected to arrive.
	 */
	public readonly $change = new Event('Inventory $change');

	/**
	 * The maximum number of stacks this inventory may contain. Stacks consist of one
	 * type of item only, and the maximum stack size of the stack depends on that item.
	 * Exceeding that maximum will create a new stack.
	 */
	public readonly capacity: number = Infinity;

	public constructor(maxStackCount: number = Infinity) {
		this.capacity = maxStackCount;
	}

	/**
	 * @deprecated Not tested.
	 */
	public getAvailableItems() {
		return this.items.filter(({ quantity }) => quantity > 0);
	}

	/**
	 * The amount of this material in stock, ready for somebody else to do something with.
	 *
	 * @todo This should take reservations into account
	 */
	public availableOf(material: Material): number {
		return this.items.find((item) => item.material === material)?.quantity || 0;
	}

	public getReservedIncomingItems() {
		return Array.from(this.reservations.values())
			.reduce<MaterialState[]>((states, exchange) => states.concat(exchange), [])
			.filter(({ quantity }) => quantity > 0);
	}
	/**
	 * Get the quantity of this material expected to come in in the future.
	 */
	public reservedIncomingOf(material: Material): number {
		let total = 0;
		for (const exchange of this.reservations.values()) {
			for (const { quantity, material: mat } of exchange) {
				if (mat === material && quantity > 0) {
					total += quantity;
				}
			}
		}
		return total;
	}

	/**
	 * The total amount of additional material of this type that could be stored in this inventory,
	 * keeping in mind stack restrictions and (incoming) reserved space.
	 *
	 * @todo Test
	 * @todo Test that reservations are taken into account
	 */
	public allocatableTo(material: Material): number {
		if (this.capacity === Infinity) {
			return Infinity;
		}

		const inOccupiedStacks =
			Math.ceil((this.availableOf(material) + this.reservedIncomingOf(material)) / material.stack) *
			material.stack;
		const openStacks = this.capacity - this.getUsedStackSpace();
		const inOpenStacks = openStacks * material.stack;
		return inOccupiedStacks + inOpenStacks;
	}

	/**
	 * Returns TRUE if the specified material/quantities fit in this inventory on top of the stuff
	 * that is already there -- keeping in mind that one stack can be of only one material type.
	 */
	public isEverythingAllocatable(cargo: MaterialState[]) {
		if (this.capacity === Infinity) {
			return true;
		}

		const combined = cargo.reduce(
			(totals, { material, quantity }) => {
				const existing = totals.find((t) => t.material === material);
				if (existing) {
					existing.quantity += quantity;
				} else {
					totals.push({ quantity, material });
				}
				return totals;
			},
			// Clone each object from getAvailableItems so we don't change the inventory by reference
			// from within the reducer 😬
			[
				...this.getAvailableItems().map((state) => ({ ...state })),
				...this.getReservedIncomingItems().map((state) => ({ ...state })),
			],
		);
		return getRequiredStackSpace(combined) <= this.capacity;
	}

	/**
	 * Get an array of stacks in this inventory. Materials that stack up to a certain quantity are
	 * broken up into several stacks when there is more of that material in this inventory.
	 *
	 * For example:
	 * [
	 *    10x Wood,
	 *    10x Wood,
	 *    3x Wood,
	 *    1x Plank
	 * ]
	 */
	public getStacks(): MaterialState[] {
		return this.items.reduce<MaterialState[]>((stacks, { material, quantity }) => {
			return [
				...stacks,
				...Array.from(new Array(Math.ceil(quantity / material.stack))).map((_, i, all) => ({
					material,
					quantity:
						i === all.length - 1 ? quantity % material.stack || material.stack : material.stack,
				})),
			];
		}, []);
	}

	/**
	 * Get the number of whole or partial stack slots that are already in use.
	 *
	 * @TODO take reservations into account? The only consumer of getUsedStackSpace already takes reservations
	 * into account elsehow. Maybe clarify that getUsedStackSpace does in fact _not_ keep reservations in mind.
	 */
	public getUsedStackSpace() {
		return getRequiredStackSpace(this.items);
	}

	/**
	 * Change the contents of this inventory for one material.
	 *
	 * You can choose to (not) emit an update.
	 *
	 * @TODO keep reservations in mind
	 */
	public change(material: Material, delta: number, skipEvent?: boolean) {
		if (delta === 0) {
			return;
		}
		const value = this.availableOf(material) + delta;
		if (value < 0) {
			throw new Error(`Not possible to have less than 0 ${material} in inventory`);
		}
		this.set(material, value, skipEvent);
	}
	public changeMultiple(states: MaterialState[], skipEvent?: boolean) {
		states.forEach(({ material, quantity }, index) => {
			this.change(material, quantity, index === states.length - 1 ? skipEvent : true);
		});
	}

	/**
	 * Change the contents of this inventory for multiple materials at the same time.
	 *
	 * You can choose to (not) emit an update once.
	 */
	public set(material: Material, quantity: number, skipEvent?: boolean) {
		if (quantity < 0) {
			throw new Error(`Cannot have a negative amount of ${material}`);
		}
		const stateIndex = this.items.findIndex((state) => state.material === material);
		if (quantity === 0) {
			if (stateIndex == -1) {
				return;
			}
			this.items.splice(stateIndex, 1);
			if (!skipEvent) {
				this.$change.emit();
			}
			return;
		}

		if (quantity > this.allocatableTo(material)) {
			throw new Error(`Not enough stack space for ${quantity}x ${material}`);
		}
		if (stateIndex === -1) {
			this.items.push({ material, quantity });
		} else {
			this.items[stateIndex].quantity = quantity;
		}
		if (!skipEvent) {
			this.$change.emit();
		}
	}

	/**
	 * Associate with a trade order so that when this trade order completes there will not be
	 * an excess or shortage of required materials.
	 */
	public makeReservation(tradeOrder: TradeOrder) {
		if (this.reservations.get(tradeOrder)) {
			// Programmer error
			throw new Error('A reservation for this trade order already exists');
		}
		const exchanged = tradeOrder.getCargoExchangedToInventory(this);
		const added = exchanged.filter(({ quantity }) => quantity > 0);
		if (!this.isEverythingAllocatable(added)) {
			// Its not really fair to throw maybe? Might change this.
			throw new Error('Not enough available space to make a reservation');
		}
		const removed = exchanged.filter(({ quantity }) => quantity < 0);
		if (!removed.every(({ material, quantity }) => this.availableOf(material) >= quantity)) {
			// Its not really fair to throw maybe? Might change this.
			throw new Error('Not enough available material to make a reservation');
		}
		//
		this.reservations.set(tradeOrder, exchanged);
	}

	/**
	 * Remove the reservation without transferring the items for it.
	 */
	public cancelReservation(tradeOrder: TradeOrder) {
		if (!this.reservations.get(tradeOrder)) {
			// Programmer error
			throw new Error('No such reservation');
		}
		this.reservations.delete(tradeOrder);
	}

	/**
	 * Transfer the reserved items and then remove ("cancel") the reservation.
	 */
	public fulfillReservation(tradeOrder: TradeOrder) {
		// @TODO transfer materials

		this.cancelReservation(tradeOrder);
	}
}
