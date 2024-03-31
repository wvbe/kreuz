import {
	EcsEntity,
	MaterialState,
	importExportComponent,
	inventoryComponent,
	locationComponent,
	personArchetype,
} from '@lib/core';
import { expect, generateEmptyGame } from '@test';
import { createJobWorkBehavior } from '../../../level-2/behavior/reusable/nodes/createJobWorkBehavior.ts';
import { wheat } from '../../../level-2/materials.ts';
import { SimpleCoordinate } from '../../terrain/types.ts';

function createChestEntity(
	location: SimpleCoordinate,
	requestMaterialsWhenBelow: MaterialState[],
	provideMaterialsWhenAbove: MaterialState[],
) {
	const entity = { id: 'chest-' + location.join('/') };
	inventoryComponent.attach(entity, { maxStackSpace: Infinity });
	locationComponent.attach(entity, { location });
	importExportComponent.attach(entity, {
		provideMaterialsWhenAbove,
		requestMaterialsWhenBelow,
	});
	return entity as EcsEntity<
		typeof inventoryComponent | typeof locationComponent | typeof importExportComponent
	>;
}

export default async function () {
	const game = generateEmptyGame();
	const worker = personArchetype.create({
		location: [0, 0, 1],
		icon: '🤖',
		name: 'R-bot',
		behavior: createJobWorkBehavior(),
	});
	await game.entities.add(worker);

	const chest1 = createChestEntity([2, 2, 1], [], [{ material: wheat, quantity: 100 }]);
	chest1.inventory.change(wheat, 1000);
	await game.entities.add(chest1);

	const chest2 = createChestEntity([2, 0, 1], [{ material: wheat, quantity: 1000 }], []);
	await game.entities.add(chest2);
	return game;
}
