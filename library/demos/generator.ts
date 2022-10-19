/**
 * The expected outcome is a game that keeps on running.
 */

import { Game, PersonEntity, SettlementEntity } from '@lib';
import { Random } from '../src/classes/Random.ts';
import { Demo } from './types.ts';
import { generateDualMeshTerrain } from './utils/generateDualMeshTerrain.ts';
import { generateJobs } from './utils/generateJobs.ts';

export function generateEntities(game: Game) {
	const walkableTiles = game.terrain.tiles.filter((c) => c.isLand());
	if (!walkableTiles.length) {
		throw new Error('The terrain does not contain any walkable tiles!');
	}

	for (let i = 0; i < Random.between(12, 20, game.seed, 'guardamount'); i++) {
		const id = `${game.seed}-person-${i}`;
		const entity = new PersonEntity(id, Random.fromArray(walkableTiles, id, 'start'));
		game.entities.add(entity);
	}

	for (let i = 0; i < Random.between(10, 14, game.seed, 'settlements'); i++) {
		const id = `${game.seed}-settlement-${i}`;
		const entity = new SettlementEntity(id, Random.fromArray(walkableTiles, id, 'start'), {
			areaSize: Random.between(0.3, 0.6, game.seed, 'setsize', i),
			minimumBuildingLength: 0.2,
			scale: 0.5,
		});
		game.entities.add(entity);
	}
}

const demo: Demo = (driver) => {
	const game = new Game(1, generateDualMeshTerrain(1, 20, 1));
	driver.attach(game);

	generateEntities(game);
	generateJobs(game);

	return { driver, game };
};

export default demo;
