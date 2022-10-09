import Game from './Game.ts';
import { generateDualMeshTerrain } from './generators/generateDualMeshTerrain.ts';
import { generateEntities } from './generators/generateEntities.ts';
import { SeedI } from './types.ts';

type RandomGameOptions = {
	size: number;
	density: number;
};

class Generator {
	static randomGame(seed: SeedI, options: Partial<RandomGameOptions>) {
		const { size, density } = {
			size: 20,
			density: 1,
			...options,
		};
		const terrain = generateDualMeshTerrain(seed, size, density);
		const entities = generateEntities(seed, terrain);
		const game = new Game(seed, terrain, entities);
		return game;
	}
}

export default Generator;
