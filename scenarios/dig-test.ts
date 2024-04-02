import {
	DEFAULT_ASSETS,
	DriverI,
	Game,
	behaviorComponent,
	inventoryComponent,
	locationComponent,
	materials,
	pathingComponent,
	personArchetype,
	visibilityComponent,
} from '@lib';
import { generateGridTerrainFromAscii } from '@test';
import { createJobWorkBehavior } from '../library/level-2/behavior/reusable/nodes/createJobWorkBehavior.ts';

export default async function (driver: DriverI) {
	const terrain = generateGridTerrainFromAscii(`
		---------------------------------
		---------------------------------
		---------------------------------
		---------------------------------
		---------------------------------
		----------XXXXX--XXXXX-----------
		----------XXX------XXX-----------
		----------XXX------XXX-----------
		----------XXX------XXX-----------
		----------XXX------XXX-----------
		----------XXX------XXX-----------
		----------XXXXXXXXXXXX-----------
		---------------------------------
		---------------------------------
		---------------------------------
		---------------------------------
		---------------------------------
	`);
	const game = new Game(driver, '1', terrain, DEFAULT_ASSETS);

	for (let i = 0; i < 5; i++) {
		const entity = { id: String(i) };
		inventoryComponent.attach(entity, {
			maxStackSpace: 10,
			availableItems: [{ material: materials.pickaxe, quantity: 1 }],
		});
		visibilityComponent.attach(entity, {
			icon: '🤖',
			name: `Excavator ${i + 1}`,
		});
		locationComponent.attach(entity, { location: [10, 5, 0] });
		pathingComponent.attach(entity, { walkSpeed: 10 });
		behaviorComponent.attach(entity, {
			behavior: createJobWorkBehavior(),
		});
		await game.entities.add(entity);
	}

	return game;
}
