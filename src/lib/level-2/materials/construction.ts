import { Material } from '../../level-1/ecs/types';

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
