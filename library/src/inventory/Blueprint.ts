import { Inventory } from './Inventory.ts';
import { MaterialI } from './types.ts';

type BlueprintOptions = {
	fullTimeEquivalent: number;
	buildingCompatibility: string[];
};

type BlueprintIo = {
	material: MaterialI;
	quantity: number;
};

const defaultBlueprintOptions: BlueprintOptions = {
	fullTimeEquivalent: 1,
	buildingCompatibility: [],
};

/**
 * The stateless description of a manufactoring process, such as transforming iron ore into iron ingots.
 */
export class Blueprint {
	public readonly name: string;
	public readonly ingredients: BlueprintIo[];
	public readonly products: BlueprintIo[];
	public options: BlueprintOptions;

	constructor(
		name: string,
		ingredients: BlueprintIo[],
		products: BlueprintIo[],
		options?: Partial<BlueprintOptions>,
	) {
		this.name = name;
		this.ingredients = ingredients;
		this.products = products;
		this.options = { ...defaultBlueprintOptions, ...options };
	}

	transferIngredients(inventoryFrom: Inventory, inventoryTo: Inventory) {
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

	hasAllIngredients(inventory: Inventory) {
		return this.ingredients.every(
			({ material, quantity }) => inventory.availableOf(material) >= quantity,
		);
	}
}
