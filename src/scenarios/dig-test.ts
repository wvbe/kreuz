import { DriverI } from '../lib/level-1/drivers/types.js';
import { behaviorComponent } from '../lib/level-1/ecs/components/behaviorComponent';
import { eventLogComponent } from '../lib/level-1/ecs/components/eventLogComponent';
import { healthComponent } from '../lib/level-1/ecs/components/healthComponent';
import { inventoryComponent } from '../lib/level-1/ecs/components/inventoryComponent';
import { locationComponent } from '../lib/level-1/ecs/components/locationComponent';
import { pathingComponent } from '../lib/level-1/ecs/components/pathingComponent';
import { visibilityComponent } from '../lib/level-1/ecs/components/visibilityComponent';
import Game from '../lib/level-1/Game';
import { createJobWorkBehavior } from '../lib/level-2/behavior/reusable/nodes/createJobWorkBehavior';
import { DEFAULT_ASSETS } from '../lib/level-2/DEFAULT_ASSETS';
import { generateGridTerrainFromAscii } from '../lib/test/generateGridTerrainFromAscii';

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
		eventLogComponent.attach(entity, {});
		locationComponent.attach(entity, { location: [10, 5, 0] });
		pathingComponent.attach(entity, { walkSpeed: 10 });
		behaviorComponent.attach(entity, {
			behavior: createJobWorkBehavior(),
		});
		healthComponent.attach(entity, { health: 1 });
		await game.entities.add(entity);
	}

	return game;
}
