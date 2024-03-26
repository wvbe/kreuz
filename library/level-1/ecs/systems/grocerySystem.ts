import Game from '../../Game.ts';
import { type Material } from '../../inventory/Material.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { pathingComponent } from '../components/pathingComponent.ts';
import { productionComponent } from '../components/productionComponent.ts';
import { Blueprint } from '../components/productionComponent/Blueprint.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { vendorComponent } from '../components/vendorComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { EcsEntity } from '../types.ts';

type GroceryPurchasingEntity = EcsEntity<
	| typeof locationComponent
	| typeof pathingComponent
	| typeof inventoryComponent
	| typeof wealthComponent
>;

type GrocerySellingEntity = EcsEntity<
	| typeof locationComponent
	| typeof inventoryComponent
	| typeof wealthComponent
	| typeof vendorComponent
>;

async function attachSystemToEntity(game: Game, entity: GroceryPurchasingEntity) {
	
}

async function attachSystem(game: Game) {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(
					(entity): entity is ProductionSystemFactoryEntity =>
						productionComponent.test(entity) &&
						statusComponent.test(entity) &&
						inventoryComponent.test(entity) &&
						locationComponent.test(entity),
				)
				.map((person) => attachSystemToEntity(game, person)),
		);
	});
}

/**
 * The production system lets factories or other entities with production-related components produce
 * {@link Material}s. A {@link Blueprint} is used as the recipe for this production process.
 *
 * Blueprint ingredients and products are all exchanged within the inventory belonging to the factory
 * entity.
 *
 * The production speed is determined by the amount of worker entities at the factory -- the
 * production speed is linear to the number of workers, unless there are too little workers to
 * satisfy the requirement of a blueprint, in which case the production speed is penalized by 70%.
 *
 * When a production cycle is complete and there is still enough ingredients as well as avaialble space
 * in the inventory, and workers present, a new production cycle starts automatically.
 */
export const productionSystem = new EcsSystem(
	[
		productionComponent,
		statusComponent,
		locationComponent,
		inventoryComponent,
		pathingComponent,
		healthComponent,
	],
	attachSystem,
);
