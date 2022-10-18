import { Material } from '../inventory/Material.ts';

// A grassy plant whose seed is a worldwide staple food.
export const wheat = new Material('Wheat', {
	symbol: 'WH',
	stackSize: 100,
});

// Wheat, but punched into a powder
export const flour = new Material('Flour', {
	symbol: 'F',
	stackSize: 100,
});

// The harder outer layer of cereal grain. A byproduct of making flour.
export const bran = new Material('Bran', {
	symbol: 'B',
	stackSize: 100,
});

export const milk = new Material('Milk', {
	symbol: 'M',
	stackSize: 24,
});

export const butter = new Material('Butter', {
	symbol: 'Bu',
	stackSize: 50,
});

export const eggs = new Material('Egg', {
	symbol: 'Egg',
	stackSize: 144,
});

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
