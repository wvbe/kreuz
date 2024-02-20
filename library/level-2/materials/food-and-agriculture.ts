import { Material } from '../../level-1/mod.ts';

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

export const bread = new Material('Bread', {
	symbol: '🥖',
	stackSize: 100,

	value: 3,
	nutrition: 0.8,
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
