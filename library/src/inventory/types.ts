import { type Material } from './Material.ts';

/**
 * @deprecated Can probably always reference the Material class.
 */
export interface MaterialI {
	label: string;
	symbol: string;
	/**
	 * The amount of materials that fits in one stack. A voluminous material has a smaller stack size.
	 */
	stack: number;
}

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
