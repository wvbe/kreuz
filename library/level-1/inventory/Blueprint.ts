import Game from '../Game.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
import { type Inventory } from './Inventory.ts';
import { type MaterialState } from './types.ts';

export type SaveBlueprintJson = {
	name: string;
	ingredients: Array<{ material: string; quantity: number }>;
	products: Array<{ material: string; quantity: number }>;
	options: BlueprintOptions;
};
type BlueprintOptions = {
	fullTimeEquivalent: number;
	buildingName: string;
	workersRequired: number;
	// buildingCompatibility: string[];
};

const defaultBlueprintOptions: BlueprintOptions = {
	fullTimeEquivalent: 1,
	buildingName: 'Factory',
	workersRequired: 1,
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
		for (const { material, quantity } of this.ingredients) {
			const demand =
				Math.min(quantity, inventoryFrom.availableOf(material)) - inventoryTo.availableOf(material);
			if (demand <= 0) {
				continue;
			}
			inventoryFrom.change(material, -demand);
			inventoryTo.change(material, demand);
		}
	}

	public hasAllIngredients(inventory: Inventory) {
		return this.ingredients.every(
			({ material, quantity }) => inventory.availableOf(material) >= quantity,
		);
	}

	public canPlaceAllProducts(inventory: Inventory) {
		return this.products.every(
			({ material, quantity }) => inventory.availableOf(material) >= quantity,
		);
	}

	// @TODO Registry
	public toSaveJson(context: SaveJsonContext): SaveBlueprintJson {
		return {
			name: this.name,
			ingredients: this.ingredients.map(({ material, quantity }) => ({
				material: context.materials.key(material, true),
				quantity,
			})),
			products: this.products.map(({ material, quantity }) => ({
				material: context.materials.key(material, true),
				quantity,
			})),
			options: this.options,
		};
	}

	// @TODO Registry
	public static fromSaveJson(context: SaveJsonContext, save: SaveBlueprintJson) {
		return new Blueprint(
			save.name,
			save.ingredients.map(({ material, quantity }) => ({
				material: context.materials.item(material, true),
				quantity,
			})),
			save.products.map(({ material, quantity }) => ({
				material: context.materials.item(material, true),
				quantity,
			})),
			save.options,
		);
	}
}
