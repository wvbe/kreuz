import { Material } from '../level-1.ts';

/*
 * FOOD AND AGRICULTURE
 */

// A grassy plant whose seed is a worldwide staple food.
export const wheat = new Material('Wheat', {
	symbol: 'WH',
	stackSize: 100,
});

// Wheat, but punched into a powder
export const flour = new Material('Flour', {
	symbol: '🌸',
	stackSize: 100,
});

// The harder outer layer of cereal grain. A byproduct of making flour.
export const bran = new Material('Bran', {
	symbol: 'B',
	stackSize: 100,
});

export const honey = new Material('Honey', {
	symbol: '🍯',
	stackSize: 100,

	value: 3,
	nutrition: 0.05,
});

export const milk = new Material('Milk', {
	symbol: '🥛',
	stackSize: 24,

	value: 1.6,
	fluid: 0.3,
});

export const butter = new Material('Butter', {
	symbol: '🧈',
	stackSize: 50,

	value: 2.2,
	nutrition: 0.2,
});

export const eggs = new Material('Egg', {
	symbol: '🥚',
	stackSize: 144,

	value: 2,
	nutrition: 0.1,
});

export const freshWater = new Material('Fresh water', {
	symbol: '💧',
	stackSize: 100,

	value: 0.3,
	fluid: 0.5,
});

export const saltWater = new Material('Salt water', {
	symbol: '💧',
	stackSize: 100,

	value: 0.1,
	fluid: 0.5,
	toxicity: 0.25,
});

/*
 * CONSTRUCTION MATERIALS
 */
export const rawIronOre = new Material('Iron ore', {
	symbol: 'Io',
	stackSize: 50,
});
export const rawCopperOre = new Material('Copper ore', {
	symbol: 'Co',
	stackSize: 50,
});
export const rawTinOre = new Material('Tin ore', {
	symbol: 'To',
	stackSize: 50,
});
export const rawCoal = new Material('Coal', {
	symbol: 'C',
	stackSize: 50,
});

/**
 * A bar of pure iron, suitable for processing into other materials.
 */
export const ironIngot = new Material('Iron ingot', {
	symbol: 'Ii',
	stackSize: 30,
});
export const tinIngot = new Material('Tin ingot', {
	symbol: 'Ti',
	stackSize: 30,
});
export const copperIngot = new Material('Copper ingot', {
	symbol: 'Ci',
	stackSize: 30,
});
export const bronzeIngot = new Material('Bronze ingot', {
	symbol: 'Bi',
	stackSize: 30,
});

/*
 * TOOLS
 */

export const hammer = new Material('Hammer', {
	symbol: '🔨',
	stackSize: 5,

	value: 50,
});
export const pickaxe = new Material('Pickaxe', {
	symbol: '⛏',
	stackSize: 1,

	value: 120,
});
export const woodsaw = new Material('Woodsaw', {
	symbol: '🪚',
	stackSize: 3,

	value: 70,
});
export const axe = new Material('Woodaxe', {
	symbol: '🪓',
	stackSize: 1,

	value: 80,
});
