import Game from './Game';
import { generateDualMeshTerrain } from './generators/generateDualMeshTerrain';
import { generateEntities } from './generators/generateEntities';
import { SeedI } from './types';

type RandomGameOptions = {
	size: number;
	density: number;
};

class Generator {
	static randomGame(seed: SeedI, options: Partial<RandomGameOptions>) {
		const { size, density } = {
			size: 20,
			density: 1,
			...options
		};
		const terrain = generateDualMeshTerrain(seed, size, density);
		const entities = generateEntities(seed, terrain);
		const game = new Game(seed, terrain, entities);
		return game;
	}
}

export default Generator;
