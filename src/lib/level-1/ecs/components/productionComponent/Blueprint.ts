import { type MaterialState } from '../../../inventory/types';
import { SaveJsonContext } from '../../../types-savedgame';
import { type Inventory } from '../inventoryComponent/Inventory';

export type SaveBlueprintJson = {
	name: string;
	ingredients: Array<{ material: string; quantity: number }>;
	products: Array<{ material: string; quantity: number }>;
	options: BlueprintOptions;
};
type BlueprintOptions = {
	fullTimeEquivalent: number;
	buildingName: string;

	/**
	 * The amount of workers necessary to achieve nominal work speed.
	 * - If the amount of workers is lower, the work speed is proportionally lower, then a penalty of 70% is deducted.
	 * - A factory may have more workers than necessary for a blueprint. So long as at least 1 blueprints minimum
	 *   required workers is achieved, every additional blueprint that can be ran parallel does not receive a penalty.
	 */
	workersRequired: number;
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
	public async transferIngredients(inventoryFrom: Inventory, inventoryTo: Inventory) {
		for (const { material, quantity } of this.ingredients) {
			const demand =
				Math.min(quantity, inventoryFrom.availableOf(material)) -
				inventoryTo.availableOf(material);
			if (demand <= 0) {
				continue;
			}
			await inventoryFrom.change(material, -demand);
			await inventoryTo.change(material, demand);
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

	public static async fromSaveJson(
		context: SaveJsonContext,
		save: SaveBlueprintJson,
	): Promise<Blueprint> {
		return new Blueprint(
			save.name,
			save.ingredients.map(({ material, quantity }) => ({
				material: context.materials.get(material),
				quantity,
			})),
			save.products.map(({ material, quantity }) => ({
				material: context.materials.get(material),
				quantity,
			})),
			save.options,
		);
	}
}
