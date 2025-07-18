import { Material } from '../../level-1/inventory/Material';
import { RawMaterial } from './types';

// Raw Materials - Base materials from the environment
export const woodLogs: RawMaterial = {
	...new Material('Wood Logs', {
		symbol: '🪵',
		stackSize: 10,
		value: 2,
	}),
	type: 'raw',
	description: 'Fresh cut logs from trees, ready to be processed into lumber',
};

export const ironOre: RawMaterial = {
	...new Material('Iron Ore', {
		symbol: '⛏️',
		stackSize: 20,
		value: 5,
	}),
	type: 'raw',
	description: 'Raw iron ore extracted from the mountain, needs smelting',
};

export const clay: RawMaterial = {
	...new Material('Clay', {
		symbol: '🧱',
		stackSize: 15,
		value: 1,
	}),
	type: 'raw',
	description: 'Malleable clay soil, perfect for pottery and ceramics',
};

export const beeswax: RawMaterial = {
	...new Material('Beeswax', {
		symbol: '🐝',
		stackSize: 25,
		value: 8,
	}),
	type: 'raw',
	description: 'Natural wax from bee hives, used for candle making',
};
