import { MaterialI } from './types.ts';

export class Material implements MaterialI {
	label: string;
	symbol: string;
	stack: number;
	constructor(label: string, { symbol, stackSize }: { symbol: string; stackSize: number }) {
		this.label = label;
		this.stack = stackSize;
		this.symbol = symbol;
	}
}
