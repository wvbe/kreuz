import Game from '../../Game.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { PersonNeedId } from '../../constants/needs.ts';
import { Need } from '../../entities/Need.ts';
import { needsComponent } from '../components/needsComponent.ts';
import { MaterialState } from '../../inventory/types.ts';
import { Inventory } from '../components/inventoryComponent/Inventory.ts';
import { EcsEntity } from '../types.ts';
import { statusComponent } from '@lib/core';

type SelfSustainingEnitity = EcsEntity<typeof needsComponent | typeof inventoryComponent>;

function selectMaterialsFromInventoryToSatistfyNeed(
	inventory: Inventory,
	craving: PersonNeedId,
	quantity: number,
): MaterialState[] {
	const materials = inventory
		.getAvailableItems()
		.filter((item) => item.material[craving] > 0)
		.sort((a, b) => a.material[craving] - b.material[craving]);
	if (!materials.length) {
		return [];
	}
	let accum = 0;
	const order: MaterialState[] = [{ material: materials[0].material, quantity: 0 }];
	while (materials.length) {
		const state = materials[0];
		if (state.material !== order[0].material) {
			order.unshift({ material: state.material, quantity: 0 });
		}
		accum += state.material[craving];
		order[0].quantity++;
		state.quantity--;
		if (state.quantity <= 0) {
			materials.shift();
		}
		if (accum >= quantity) {
			break;
		}
	}
	return order;
}

function attachSystemToEntityNeed(game: Game, entity: SelfSustainingEnitity, need: Need) {
	// const satisfy = async () => {
	// 	const order = selectMaterialsFromInventoryToSatistfyNeed(
	// 		entity.inventory,
	// 		need.id,
	// 		0.9 - need.get(),
	// 	);
	// 	if (!order.length) {
	// 		// Bummer, the entity will go hungry or thirsty today. Let's hope that (via another system)
	// 		// they manage to acquire some sustenance.
	// 		return;
	// 	}
	// 	const originalDelta = need.delta;
	// 	need.setDelta(0);
	// 	for (const { material, quantity } of order) {
	// 		if (statusComponent.test(entity)) {
	// 			entity.$status.set(`Eating ${quantity} of ${material}...`);
	// 		}
	// 		for (let index = 0; index < quantity; index++) {
	// 			await entity.inventory.change(material, -1);
	// 			await game.time.wait(quantity * 1_000);
	// 			need.set(Math.min(1, need.get() + material[need.id]));
	// 		}
	// 	}
	// 	need.setDelta(originalDelta);
	// };
	const satisfy = async () => {
		const originalDelta = need.delta;
		// need.setDelta(0);
		while (need.get() < 0.9) {
			const stock = entity.inventory
				.getAvailableItems()
				.filter((item) => item.material[need.id] > 0)
				.sort((a, b) => a.material[need.id] - b.material[need.id])
				.shift();
			if (!stock) {
				break;
			}

			// @TODO remove me, this is a debug hack:
			(entity as any).$status?.set(`Eating ${stock.material}...`);

			await entity.inventory.change(stock.material, -1);
			await game.time.wait(1 * 1_000);
			need.set(Math.min(1, need.get() + stock.material[need.id]));
		}

		// need.setDelta(originalDelta);
	};
	need.onBelow(0.3, () => {
		// An IIFE to make the async/await work without blocking the `onBelow` event handler
		satisfy();
	});
	entity.inventory.$change.on(() => {
		if (need.get() < 0.3) {
			satisfy();
		}
	});
}

async function attachSystemToEntity(game: Game, entity: SelfSustainingEnitity) {
	attachSystemToEntityNeed(game, entity, entity.needs.nutrition);
	attachSystemToEntityNeed(game, entity, entity.needs.hydration);
}

async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is SelfSustainingEnitity =>
						needsComponent.test(entity) && inventoryComponent.test(entity),
				)
				.map((entity) => attachSystemToEntity(game, entity)),
		);
	});
}

/**
 * This system lets entities who have _needs_ (nutrition, hydration, etc) and
 * an inventory grab items from that inventory to satistfy their needs.
 *
 * Every time they do, they will grab as many items as needed to satisfy the particular
 * need to at least 90%, or slightly over if the item they are consuming is very satisfactory.
 *
 * Consuming an item will take a little time, at the end of which the need is fulfilled for
 * the nutritional value of that item. While the item is being consumed, that need does not degrade.
 * An entity can consume materials to satisfy different needs at the same time.
 *
 * @todo Pick items even more efficiently so that the need is never satisfied beyond 100%.
 * @todo Plus _all_ the needs that are satisfied by an item, eg. nutrition+hydration at the
 *   same time when eating an apple.
 */
export const selfsustainingSystem = new EcsSystem([], attachSystem);
