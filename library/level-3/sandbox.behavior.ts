/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	ChurchBuildingEntity,
	FactoryBuildingEntity,
	Game,
	generateGridTerrainFromAscii,
	PersonEntity,
	Random,
	MarketBuildingEntity,
	SettlementEntity,
} from '@lib/core';
import { headOfState } from '../level-2/heroes.ts';
import {
	blueprints,
	behavior,
	getRandomSettlementName,
	DEFAULT_ASSETS,
	materials,
} from '@lib/assets';
import { Demo } from './types.ts';

const demo: Demo = async (driver) => {
	const terrain = generateGridTerrainFromAscii(`
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
		XXXXXXXXXXXXXXX
	`);

	const game = new Game('1', terrain, DEFAULT_ASSETS);
	await driver.attach(game);

	const entity = new PersonEntity(
		'person-0',
		terrain
			.getTileClosestToXy(
				Math.floor(Random.between(0, 10, 'zfs', 0)),
				Math.floor(Random.between(0, 10, 'zfs', 0 + 'f')),
			)
			.toArray(),
		{ gender: 'f', firstName: 'Test' },
	);
	await entity.wallet.set(500);

	const church = new ChurchBuildingEntity('church', terrain.getTileClosestToXy(3, 3).toArray());

	const settlement = new SettlementEntity(
		'settlement',
		terrain.getTileClosestToXy(13, 8).toArray(),
		{
			name: getRandomSettlementName(['settlement name']),
			areaSize: 1,
			minimumBuildingLength: 1,
			scale: 1,
		},
	);

	const marketStall = new MarketBuildingEntity(
		'market',
		terrain.getTileClosestToXy(5, 5).toArray(),
		materials.eggs,
		headOfState,
	);
	await marketStall.inventory.change(materials.eggs, 30);

	const factory = new FactoryBuildingEntity(
		'factory',
		terrain.getTileClosestToXy(13, 10).toArray(),
		headOfState,
		{
			blueprint: blueprints.beeKeeping,
			maxWorkers: 4,
			maxStackSpace: 8,
		},
	);

	await game.entities.add(entity, church, settlement, marketStall, factory);

	await entity.$behavior.set(behavior.civilianBehavior);

	return { driver, game };
};

export default demo;
