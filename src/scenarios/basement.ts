/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { civilianBehavior } from '../game/assets/behavior';
import { DriverI } from '../game/core/drivers/types';
import { personArchetype } from '../game/core/ecs/archetypes/personArchetype';
import { portalArchetype } from '../game/core/ecs/archetypes/portalArchetype';
import {
	RawMaterialType,
	regeneratingRawMaterialArchetype,
} from '../game/core/ecs/archetypes/regeneratingRawMaterialArchetype';
import Game from '../game/core/Game';
import { generateGridTerrainFromAscii } from '../game/test/generateGridTerrainFromAscii';

export default async function (driver: DriverI) {
	const game = new Game(driver, '1');

	await game.terrain.addTiles(
		generateGridTerrainFromAscii(`
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
			XXXXXXXXXXXX
		`),
	);

	for (let i = 2; i < 6; i++) {
		const regeneratingRawMaterial = regeneratingRawMaterialArchetype.create({
			location: [game.terrain, i, 5, 0],
			type: RawMaterialType.PINEWOOD,
		});
		await game.entities.add(regeneratingRawMaterial);
	}

	const entity = personArchetype.create({
		location: game.terrain.getTileClosestToXy(0, 0).location.get(),
		name: 'Rowbot',
		icon: '🤖',
		behavior: civilianBehavior,
		wealth: 10_000,
		immortal: true,
	});
	await game.entities.add(entity);

	const portal = portalArchetype.create({
		location: [game.terrain, 3, 2, 0],
		name: 'Portal to another place',
		tiles: generateGridTerrainFromAscii(`
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXXX
			---------------X--`),
		portalEnd: [15, 9, 0],
	});
	await game.entities.add(portal);

	const portalBack = portalArchetype.create({
		name: 'Portal to another place',
		reverseOfPortalEntity: portal,
	});
	await game.entities.add(portalBack);
	return game;
}
