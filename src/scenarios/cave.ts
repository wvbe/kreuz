import { Random } from '../lib/level-1/classes/Random';
import { DriverI } from '../lib/level-1/drivers/types';
import { personArchetype } from '../lib/level-1/ecs/archetypes/personArchetype';
import Game from '../lib/level-1/Game';
import { civilianBehavior } from '../lib/level-2/behavior';
import { generateIslandTiles } from '../lib/level-3/generators/generateIslandTiles';
import { generatePassport } from '../lib/level-3/generators/generatePassport';
import { growTerrainForExcavatedEdges } from '../lib/level-3/modifiers/growTerrainForExcavatedEdges';

export const caveScene = async function (driver: DriverI) {
	const game = new Game(driver, '1');

	game.terrain.tiles.$add.on(growTerrainForExcavatedEdges.bind(game));

	await game.entities.add(...generateIslandTiles(['xxx ""']));

	for (let index = 0; index < 20; index++) {
		const entitySeed = Random.float(`bzt-${index}`);
		const entity = personArchetype.create({
			...generatePassport(['pass', entitySeed]),
			location: Random.fromArray(
				game.terrain.tiles.filter((tile) => tile.walkability > 0),
				`ferge${entitySeed}`,
			).location.get(),
			behavior: civilianBehavior,
			wealth: Random.between(300, 600, `money${entitySeed}`),
		});
		// entity.inventory.change(game.assets.materials.get('pickaxe'), 1);
		await game.entities.add(entity);
	}

	return game;
};
