/**
 * The expected outcome is a game that keeps on running.
 */

import { Game } from '@lib';
import { Demo } from './types.ts';
import { generateDualMeshTerrain } from './utils/generateDualMeshTerrain.ts';
import { generateEntities } from './utils/generateEntities.ts';

const demo: Demo = (driver) => {
	const game = new Game(1, generateDualMeshTerrain(1, 20, 1));

	driver.attach(game);

	game.entities.add(...generateEntities(game.seed, 20, game.terrain));
	return { driver, game };
};

export default demo;
