import { type Material } from './Material.ts';

export interface MaterialState {
	/**
	 * The material
	 */
	material: Material;
	/**
	 * The amount of this material available for whoever wants it.
	 */
	quantity: number;
}
