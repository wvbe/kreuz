import { Material } from '../../level-1/inventory/Material';
import { beeswax, clay, ironOre, woodLogs } from './rawMaterials';
import { ProcessedMaterial } from './types';

// Processed Materials - Individual exported constants
export const woodenPlanks: ProcessedMaterial = {
	...new Material('Wooden Planks', {
		symbol: '🪚',
		stackSize: 8,
		value: 6,
	}),
	type: 'processed',
	construction: {
		time: 120, // 2 minutes
		requiredMaterials: [
			{ material: woodLogs, quantity: 2 }, // 2 Wood Logs
		],
	},
};

export const woodenSticks: ProcessedMaterial = {
	...new Material('Wooden Sticks', {
		symbol: '🦯',
		stackSize: 20,
		value: 1,
	}),
	type: 'processed',
	construction: {
		time: 60, // 1 minute
		requiredMaterials: [
			{ material: woodLogs, quantity: 1 }, // 1 Wood Log
		],
	},
};

export const woodenPegs: ProcessedMaterial = {
	...new Material('Wooden Pegs', {
		symbol: '📌',
		stackSize: 30,
		value: 2,
	}),
	type: 'processed',
	construction: {
		time: 90, // 1.5 minutes
		requiredMaterials: [
			{ material: woodLogs, quantity: 1 }, // 1 Wood Log
		],
	},
};

export const ironIngots: ProcessedMaterial = {
	...new Material('Iron Ingots', {
		symbol: '🔩',
		stackSize: 15,
		value: 12,
	}),
	type: 'processed',
	construction: {
		time: 300, // 5 minutes
		requiredMaterials: [
			{ material: ironOre, quantity: 3 }, // 3 Iron Ore
		],
	},
};

export const ironNails: ProcessedMaterial = {
	...new Material('Iron Nails', {
		symbol: '🔨',
		stackSize: 50,
		value: 3,
	}),
	type: 'processed',
	construction: {
		time: 180, // 3 minutes
		requiredMaterials: [
			{ material: ironIngots, quantity: 1 }, // 1 Iron Ingot
		],
	},
};

export const ceramic: ProcessedMaterial = {
	...new Material('Ceramic', {
		symbol: '🏺',
		stackSize: 12,
		value: 8,
	}),
	type: 'processed',
	construction: {
		time: 240, // 4 minutes
		requiredMaterials: [
			{ material: clay, quantity: 2 }, // 2 Clay
		],
	},
};

export const candleWax: ProcessedMaterial = {
	...new Material('Candle Wax', {
		symbol: '🕯️',
		stackSize: 20,
		value: 15,
	}),
	type: 'processed',
	construction: {
		time: 90, // 1.5 minutes
		requiredMaterials: [
			{ material: beeswax, quantity: 1 }, // 1 Beeswax
		],
	},
};
