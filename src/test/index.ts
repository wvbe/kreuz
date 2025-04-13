import { expect } from '@jest/globals';

export { expect };

export const generateEmptyGame = async () => {
	// TODO: Implement this based on your game's requirements
	return {
		terrain: {
			getTileClosestToXy: (x: number, y: number) => ({
				location: {
					get: () => ({ x, y }),
				},
			}),
		},
		entities: {
			add: async (entity: any) => {},
		},
		time: {
			now: 0,
			steps: async (steps: number) => {
				// TODO: Implement time stepping logic
			},
		},
	};
};

export const mock = {
	fn: jest.fn,
};
