import { MaterialI } from './types.ts';

export class Material implements MaterialI {
	label: string;
	stack: number;
	constructor(label: string, stackSize: number) {
		this.label = label;
		this.stack = stackSize;
	}
}
