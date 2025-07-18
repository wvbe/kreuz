import { mapMarkerArchetype } from '../../level-1/ecs/archetypes/mapMarkerArchetype';
import { Material } from '../../level-1/inventory/Material';
import { SimpleCoordinate } from '../../level-1/terrain/types';
import {
	candleWax,
	ceramic,
	ironIngots,
	ironNails,
	woodenPegs,
	woodenPlanks,
	woodenSticks,
} from './processedMaterials';
import { Constructible } from './types';

const createMapMarkerFromSelf = (self: Constructible, location: SimpleCoordinate) =>
	mapMarkerArchetype.create({
		location,
		name: self.label,
		icon: self.symbol,
	});

// Constructible Items - Individual exported constants
export const woodenChair: Constructible = {
	...new Material('Wooden Chair', {
		symbol: '🪑',
		stackSize: 1,
		value: 25,
	}),
	type: 'furniture',
	construction: {
		time: 450, // 7.5 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 3 }, // 3 Wooden Planks
			{ material: woodenPegs, quantity: 8 }, // 8 Wooden Pegs
		],
		createEntity: createMapMarkerFromSelf,
	},
};

export const woodenStool: Constructible = {
	...new Material('Wooden Stool', {
		symbol: '🪑',
		stackSize: 1,
		value: 25,
	}),
	type: 'furniture',
	construction: {
		time: 450, // 7.5 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 3 }, // 3 Wooden Planks
			{ material: woodenPegs, quantity: 8 }, // 8 Wooden Pegs
		],
		createEntity: createMapMarkerFromSelf,
	},
};

export const woodenBed: Constructible = {
	...new Material('Wooden Bed', {
		symbol: '🛏️',
		stackSize: 1,
		value: 80,
	}),
	type: 'furniture',
	construction: {
		time: 720, // 12 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 6 }, // 6 Wooden Planks
			{ material: woodenPegs, quantity: 12 }, // 12 Wooden Pegs
			{ material: ironNails, quantity: 20 }, // 20 Iron Nails
		],
		createEntity: createMapMarkerFromSelf,
	},
};

export const woodenTable: Constructible = {
	...new Material('Wooden Table', {
		symbol: '🪙',
		stackSize: 1,
		value: 45,
	}),
	type: 'furniture',
	construction: {
		time: 600, // 10 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 4 }, // 4 Wooden Planks
			{ material: woodenPegs, quantity: 10 }, // 10 Wooden Pegs
		],
		createEntity: createMapMarkerFromSelf,
	},
};

export const woodenCabinet: Constructible = {
	...new Material('Wooden Cabinet', {
		symbol: '🗄️',
		stackSize: 1,
		value: 120,
	}),
	type: 'furniture',
	construction: {
		time: 900, // 15 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 8 }, // 8 Wooden Planks
			{ material: woodenPegs, quantity: 16 }, // 16 Wooden Pegs
			{ material: ironNails, quantity: 24 }, // 24 Iron Nails
		],
		createEntity: createMapMarkerFromSelf,
	},
};

export const woodenFootrest: Constructible = {
	...new Material('Wooden Footrest', {
		symbol: '🦵',
		stackSize: 1,
		value: 15,
	}),
	type: 'furniture',
	construction: {
		time: 300, // 5 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 2 }, // 2 Wooden Planks
			{ material: woodenPegs, quantity: 4 }, // 4 Wooden Pegs
		],
		createEntity: createMapMarkerFromSelf,
	},
};

export const ironMug: Constructible = {
	...new Material('Iron Mug', {
		symbol: '🍺',
		stackSize: 5,
		value: 18,
	}),
	type: 'furniture',
	construction: {
		time: 180, // 3 minutes
		requiredMaterials: [
			{ material: ironIngots, quantity: 1 }, // 1 Iron Ingot
		],
	},
};

export const ironPlate: Constructible = {
	...new Material('Iron Plate', {
		symbol: '🍽️',
		stackSize: 8,
		value: 15,
	}),
	type: 'furniture',
	construction: {
		time: 150, // 2.5 minutes
		requiredMaterials: [
			{ material: ironIngots, quantity: 1 }, // 1 Iron Ingot
		],
	},
};

export const ceramicPlate: Constructible = {
	...new Material('Ceramic Plate', {
		symbol: '🍽️',
		stackSize: 6,
		value: 12,
	}),
	type: 'furniture',
	construction: {
		time: 120, // 2 minutes
		requiredMaterials: [
			{ material: ceramic, quantity: 1 }, // 1 Ceramic
		],
	},
};

export const ceramicMug: Constructible = {
	...new Material('Ceramic Mug', {
		symbol: '☕',
		stackSize: 8,
		value: 10,
	}),
	type: 'furniture',
	construction: {
		time: 100, // 1.67 minutes
		requiredMaterials: [
			{ material: ceramic, quantity: 1 }, // 1 Ceramic
		],
	},
};

export const candle: Constructible = {
	...new Material('Candle', {
		symbol: '🕯️',
		stackSize: 12,
		value: 20,
	}),
	type: 'furniture',
	construction: {
		time: 60, // 1 minute
		requiredMaterials: [
			{ material: candleWax, quantity: 1 }, // 1 Candle Wax
			{ material: woodenSticks, quantity: 1 }, // 1 Wooden Stick
		],
	},
};

export const woodenBucket: Constructible = {
	...new Material('Wooden Bucket', {
		symbol: '🪣',
		stackSize: 2,
		value: 35,
	}),
	type: 'furniture',
	construction: {
		time: 240, // 4 minutes
		requiredMaterials: [
			{ material: woodenPlanks, quantity: 3 }, // 3 Wooden Planks
			{ material: ironNails, quantity: 15 }, // 15 Iron Nails
		],
		createEntity: createMapMarkerFromSelf,
	},
};
