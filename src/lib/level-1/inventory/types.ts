import { type Material } from './Material';

export interface MaterialState<M extends Material = Material> {
	/**
	 * The material
	 */
	material: M;
	/**
	 * The amount of this material available for whoever wants it.
	 */
	quantity: number;
}
