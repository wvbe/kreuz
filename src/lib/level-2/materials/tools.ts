import { Material } from '../../level-1/ecs/types';

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
