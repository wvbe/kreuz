import { ProgressingNumericValue } from '../../events/ProgressingNumericValue';
import Game from '../../Game';
import { Material } from '../../inventory/Material';
import { EcsComponent } from '../classes/EcsComponent';

type RawMaterialConfig = {
	/**
	 * The {@link Material} that is outputted after labouring on this raw material resource.
	 */
	material: Material;
	/**
	 * The quantity of the material that is gained if a resource at 100% is harvested down to 0%.
	 */
	totalCapacity: number;
	/**
	 * The initial ratio of fullness (between 0-1). Will creep up to 1 under the right circumstances.
	 */
	quantity: number;
};

type RawMaterialState = {
	/**
	 * The {@link Material} that is outputted after labouring on this raw material resource.
	 */
	material: Material;
	/**
	 * The quantity of the material that is gained if a resource at 100% is harvested down to 0%.
	 */
	totalCapacity: number;
	/**
	 * The ratio of fullness (between 0-1). Will creep up to 1 under the right circumstances.
	 */
	quantity: ProgressingNumericValue;
};

/**
 * Entities with this component have an outline or shape when you'd look at them.
 */
export const rawMaterialComponent = new EcsComponent<
	{ rawMaterials: RawMaterialConfig[] },
	{
		rawMaterials: RawMaterialState[];
		/**
		 * Returns a promise for completing the following steps:
		 * - Slowly drain the material from this entity, all the way down to zero
		 * - Restore the generation rate
		 *
		 * Returns the quantity of raw materials harvested (between 0 and the total capacity of the material)
		 */
		harvestRawMaterial: (game: Game, material: Material) => Promise<number>;
	}
>(
	(entity) => Array.isArray(entity.rawMaterials),
	(entity, options) => {
		const rawMaterials = options.rawMaterials.map((config) => ({
			material: config.material,
			totalCapacity: config.totalCapacity,
			quantity: new ProgressingNumericValue(
				config.quantity,
				{
					min: 0,
					max: 1,
					delta: 5 / 1000000,
					granularity: 5 / 1000,
				},
				'raw material',
			),
		}));

		Object.assign(entity, {
			rawMaterials,
			harvestRawMaterial: async (game: Game, material: Material) => {
				const rawMaterial = rawMaterials.find(
					(rawMaterial) => rawMaterial.material === material,
				);
				if (!rawMaterial) {
					throw new Error(`Raw material ${material} not found`);
				}
				const delta = rawMaterial.quantity.delta;
				const materialQuantity = Math.floor(
					rawMaterial.quantity.get() * rawMaterial.totalCapacity,
				);

				rawMaterial.quantity.setDelta(-1 / 10_000);
				await rawMaterial.quantity.promiseBelow(0, true);
				rawMaterial.quantity.setDelta(delta);
				return materialQuantity;
			},
		});
	},
);
