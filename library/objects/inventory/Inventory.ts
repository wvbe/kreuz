/**
 * @file
 * https://github.com/wvbe/experimental-factory-game/blob/master/src/classes/Inventory.ts
 */

import { Event } from '../classes/Event.ts';
import { type Material } from './Material.ts';
import { type MaterialState } from './types.ts';

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
	 * The amount of additional material of this type that could be stored in this inventory,
	 * keeping in mind stack restrictions.
	 */
	public emptyOf(material: Material): number {
		if (this.capacity === Infinity) {
			return Infinity;
		}

		const emptyInCurrentStacks = this.availableOf(material) % material.stack;
		const openStacks = this.capacity - this.getUsedStackSpace();
		return emptyInCurrentStacks + material.stack * openStacks;
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
	 * Get the number of stack slots that are in use
	 */
	public getUsedStackSpace() {
		return this.items.reduce<number>(
			(amount, { material, quantity }) => amount + Math.ceil(quantity / material.stack),
			0,
		);
	}

	public change(material: Material, delta: number, skipEvent?: boolean) {
		const value = this.availableOf(material) + delta;
		if (value < 0) {
			throw new Error(`Not possible to have less than 0 ${material.label} in inventory`);
		}
		return this.set(material, value, skipEvent);
	}
	public changeMultiple(states: MaterialState[], skipEvent?: boolean) {
		states.forEach(({ material, quantity }, index) => {
			this.change(material, quantity, index === states.length - 1 ? skipEvent : true);
		});
	}

	public set(material: Material, quantity: number, skipEvent?: boolean) {
		if (quantity < 0) {
			throw new Error(`Cannot have a negative amount of ${material.label}`);
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

		if (quantity > this.emptyOf(material)) {
			throw new Error(`Not enough stack space for ${quantity}x ${material.label}`);
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
