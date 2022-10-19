import { type DestroyerFn } from '../types.ts';
import { type Inventory } from './Inventory.ts';
import type Game from '../Game.ts';
import { type MaterialState } from './types.ts';

type BlueprintOptions = {
	fullTimeEquivalent: number;
	// buildingCompatibility: string[];
};

const defaultBlueprintOptions: BlueprintOptions = {
	fullTimeEquivalent: 1,
	// buildingCompatibility: [],
};

/**
 * The stateless description of a manufactoring process, such as transforming iron ore into iron ingots.
 */
export class Blueprint {
	public readonly name: string;
	public readonly ingredients: MaterialState[];
	public readonly products: MaterialState[];
	public options: BlueprintOptions;

	constructor(
		name: string,
		ingredients: MaterialState[],
		products: MaterialState[],
		options?: Partial<BlueprintOptions>,
	) {
		this.name = name;
		this.ingredients = ingredients;
		this.products = products;
		this.options = { ...defaultBlueprintOptions, ...options };
	}

	/**
	 * This method might not be necessary if we're not moving material from one inventory to another
	 * as part of running a blueprint.
	 *
	 * @deprecated Please consider method docs.
	 */
	public transferIngredients(inventoryFrom: Inventory, inventoryTo: Inventory) {
		this.ingredients.forEach(({ material, quantity }) => {
			const demand =
				Math.min(quantity, inventoryFrom.availableOf(material)) - inventoryTo.availableOf(material);
			if (demand <= 0) {
				return;
			}
			inventoryFrom.change(material, -demand);
			inventoryTo.change(material, demand);
		});
	}

	public hasAllIngredients(inventory: Inventory) {
		return this.ingredients.every(
			({ material, quantity }) => inventory.availableOf(material) >= quantity,
		);
	}
}
