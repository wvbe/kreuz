/**
 * @file
 * https://github.com/wvbe/experimental-factory-game/blob/master/src/classes/Inventory.ts
 */

import { Event } from '../classes/Event.ts';
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
	 * The amount of this material in stock, ready for somebody else to do something with.
	 */
	public availableOf(material: Material): number {
		return this.items.find((item) => item.material === material)?.quantity || 0;
	}
	/**
	 * The amount of this material in stock, ready for somebody else to do something with.
	 */
	public some(
		filter: (state: MaterialState, index: number, all: MaterialState[]) => boolean,
	): boolean {
		return this.items.some(filter);
	}

	/**
	 * The total amount of additional material of this type that could be stored in this inventory,
	 * keeping in mind stack restrictions.
	 *
	 *
	 */
	public allocatableTo(material: Material): number {
		if (this.capacity === Infinity) {
			return Infinity;
		}

		const inAllocatedStacks =
			Math.ceil(this.availableOf(material) / material.stack) * material.stack;
		const openStacks = this.capacity - this.getUsedStackSpace();
		const inOpenStacks = openStacks * material.stack;
		return inAllocatedStacks + inOpenStacks;
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
			this.getAvailableItems().map((state) => ({ ...state })),
		);
		return getRequiredStackSpace(combined) <= this.capacity;
	}

	/**
	 * @deprecated Not tested.
	 */
	public getAvailableItems() {
		return this.items.filter(({ quantity }) => quantity > 0);
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
	 */
	public getUsedStackSpace() {
		return getRequiredStackSpace(this.items);
	}

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
}
