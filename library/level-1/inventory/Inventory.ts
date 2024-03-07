/**
 * @file
 * https://github.com/wvbe/experimental-factory-game/blob/master/src/classes/Inventory.ts
 */

import { Event } from '../events/Event.ts';
import { TradeOrder } from '../classes/TradeOrder.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
import { Material } from './Material.ts';
import { type MaterialState } from './types.ts';

function getRequiredStackSpace(cargo: MaterialState[]) {
	return cargo.reduce<number>(
		(amount, { material, quantity }) => amount + Math.ceil(quantity / material.stack),
		0,
	);
}

export type SaveInventoryJson = {
	capacity: number | null;
	items: Array<{ material: string; quantity: number }>;
};

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

	/**
	 * Reservations should be made when cargo is slowly being transferred into or out of this
	 * inventory, so that the inventory does not end up with a negative amount of material, or an
	 * amount greater than the capacity.
	 */
	private readonly reservations = new Map<any, MaterialState[]>();

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
	 * List all cargo that is available to be picked up -- meaning all cargo already in stock, minus
	 * what has been reserved by others.
	 */
	public getAvailableItems() {
		return this.items
			.filter(({ quantity }) => quantity > 0)
			.map(({ material, quantity }) => ({
				material,
				quantity: quantity - this.reservedOutgoingOf(material),
			}));
	}

	/**
	 * The amount of this material in stock, ready for somebody else to do something with.
	 *
	 * This keeps in mind that some material might already be locked in as an outgoing reservation.
	 */
	public availableOf(material: Material): number {
		return (
			(this.items.find((item) => item.material === material)?.quantity || 0) -
			this.reservedOutgoingOf(material)
		);
	}

	/**
	 * List all cargo expected to be delivered soon.
	 */
	public getReservedIncomingItems() {
		return Array.from(this.reservations.values())
			.reduce<MaterialState[]>((states, exchange) => states.concat(exchange), [])
			.filter(({ quantity }) => quantity > 0);
	}

	/**
	 * Get the quantity of this material expected to delivered in the future.
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
	 * List all cargo expected to be picked up soon
	 */
	public getReservedOutgoingItems() {
		return Array.from(this.reservations.values())
			.reduce<MaterialState[]>((states, exchange) => states.concat(exchange), [])
			.filter(({ quantity }) => quantity < 0);
	}

	/**
	 * Get the quantity of this material expected to be picked up in the future.
	 */
	public reservedOutgoingOf(material: Material): number {
		let total = 0;
		for (const exchange of this.reservations.values()) {
			for (const { quantity, material: mat } of exchange) {
				if (mat === material && quantity < 0) {
					total -= quantity;
				}
			}
		}
		return total;
	}

	/**
	 * The total amount of additional material of this type that could be stored in this inventory,
	 * regardless of what has already been stored/reserved of it, but do keeping in mind that stacks
	 * cannot be mixed.
	 *
	 * @todo Test
	 * @todo Test that reservations are taken into account
	 */
	public allocatableTo(material: Material): number {
		if (this.capacity === Infinity) {
			return Infinity;
		}

		const amountOfEmptyStacks = this.capacity - this.getUsedStackSpace();
		const allocatableToEmptyStacks = amountOfEmptyStacks * material.stack;

		const amountOfOccupiedStacks = Math.ceil(
			(this.availableOf(material) +
				this.reservedIncomingOf(material) +
				this.reservedOutgoingOf(material)) /
				material.stack,
		);
		const allocatableToOccupiedStacks = amountOfOccupiedStacks * material.stack;

		return allocatableToOccupiedStacks + allocatableToEmptyStacks;
	}

	/**
	 * Returns TRUE if the specified material/quantities fit in this inventory on top of the stuff
	 * that is already there -- keeping in mind that one stack can be of only one material type, and
	 * that some materials or available space has already been locked in for reservations.
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
				...this.getAvailableItems(),
				...this.getReservedIncomingItems(),
				...this.getReservedOutgoingItems(),
			].map((state) => ({ ...state })),
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
	 * Get the number of whole or partial stack slots that are already in use. Does NOT take reservations
	 * into account.
	 *
	 * @TODO take reservations into account? The only consumer of getUsedStackSpace already takes reservations
	 * into account elsehow. Maybe clarify that getUsedStackSpace does in fact _not_ keep reservations in mind.
	 */
	public getUsedStackSpace() {
		return getRequiredStackSpace([
			// @BUG: This places items from different lists in different stacks, while in truth they can possibly
			// be combined.
			...this.items,
			...this.getReservedIncomingItems(),
			...this.getReservedOutgoingItems(),
		]);
	}

	/**
	 * Change the contents of this inventory for one material.
	 *
	 * You can choose to (not) emit an update.
	 *
	 * @TODO Keep upper limit in mind? Hm.
	 */
	public async change(material: Material, delta: number, skipEvent?: boolean) {
		if (delta === 0) {
			return;
		}
		const value = this.availableOf(material) + this.reservedOutgoingOf(material) + delta;
		if (value < 0) {
			throw new Error(`Not possible to have less than 0 ${material} in inventory`);
		}
		await this.set(material, value, skipEvent);
	}

	/**
	 * Change the contents of this inventory for multiple materials at the same time.
	 *
	 * You can choose to (not) emit an update once.
	 */
	public async changeMultiple(states: MaterialState[], skipEvent?: boolean) {
		let index = 0;
		for (const { material, quantity } of states) {
			// @TODO Promise.all?
			await this.change(material, quantity, ++index === states.length ? skipEvent : true);
		}
	}

	public async set(material: Material, quantity: number, skipEvent?: boolean) {
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
				await this.$change.emit();
			}
			return;
		}

		if (quantity > this.allocatableTo(material)) {
			// BUG: A factory may reach this point, and the error is then not handled
			throw new Error(`Not enough stack space for ${quantity}x ${material}`);
		}
		if (stateIndex === -1) {
			this.items.push({ material, quantity });
		} else {
			this.items[stateIndex].quantity = quantity;
		}
		if (!skipEvent) {
			await this.$change.emit();
		}
	}

	/**
	 * Associate with a trade order so that when this trade order completes there will not be
	 * an excess or shortage of required materials.
	 */
	public makeReservationFromTradeOrder(tradeOrder: TradeOrder) {
		const exchanged = tradeOrder.getCargoExchangedToInventory(this);
		this.makeReservation(tradeOrder, exchanged);
	}

	/**
	 * Make inventory reservations for the described exchange;
	 *
	 * - If an item in the exchange has a positive value, the inventory will make a space reservation
	 *  so there will be available space when the goods rrive
	 * - If an item has a negative value, and the inventory has enough of these items in stock,
	 *   that amount of item will be reserved ie. not given away to something else.
	 */
	public makeReservation(key: any, exchanged: MaterialState[]) {
		if (this.reservations.get(key)) {
			// Programmer error
			throw new Error('A reservation for already exists for this key');
		}
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
		this.reservations.set(key, exchanged);
	}

	/**
	 * Remove the reservation without transferring the items for it.
	 */
	public cancelReservation(tradeOrder: any) {
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

	public toSaveJson(context: SaveJsonContext): SaveInventoryJson {
		return {
			capacity: this.capacity,
			items: this.items.map(({ material, quantity }) => ({
				material: context.materials.key(material, true),
				quantity,
			})),
		};
	}

	public async overwriteFromSaveJson(
		context: SaveJsonContext,
		save: SaveInventoryJson,
	): Promise<void> {
		if (this.capacity !== save.capacity) {
			throw new Error(
				`Cannot overwrite an existing inventory with a saved inventory of a different size.`,
			);
		}
		this.items.splice(0, this.items.length);
		await this.changeMultiple(
			save.items.map(({ material, quantity }) => ({
				material: context.materials.item(material, true),
				quantity,
			})),
			true,
		);
	}
}
