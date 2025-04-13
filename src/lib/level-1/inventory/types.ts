import { type Material } from './Material';

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
