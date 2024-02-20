import {
	ExecutionNode,
	type FactoryBuildingEntity,
	SequenceNode,
	type MarketBuildingEntity,
	type Material,
	TradeOrder,
	TradeEntityI,
	EntityBlackboard,
} from '../../level-1/mod.ts';
import { walkEntityToEntity } from './reusable/travel.ts';

type Demand = {
	// @TODO replace with TradeEntity?
	entity: FactoryBuildingEntity | MarketBuildingEntity;
	material: Material;
	quantity: number;
};
type SupplyDemand = Demand & {
	supplier: FactoryBuildingEntity;
	distance: number;
};

export const transportMaterial = new SequenceNode<EntityBlackboard>(
	new ExecutionNode('Have cargo space?', (blackboard) => {
		const { game, entity } = blackboard;

		if (entity.inventory.getUsedStackSpace() >= entity.inventory.capacity) {
			throw new Error(`${entity} cannot carry any more.`);
		}

		// @TODO Use a more refined measure than just transferring exactly one whole stack
		const demandInFactories = game.entities
			.filter<FactoryBuildingEntity>((entity) => entity.type === 'factory')
			.reduce<Demand[]>((demand, factory) => {
				const blueprint = factory.$blueprint.get();
				if (!blueprint) {
					return demand;
				}
				blueprint.ingredients
					.filter(
						({ material }) =>
							factory.inventory.availableOf(material) +
								factory.inventory.reservedIncomingOf(material) <
							material.stack,
					)
					.forEach(({ material }) => {
						demand.push({ entity: factory, material, quantity: material.stack });
					});
				return demand;
			}, []);

		const demandInMarketStalls = game.entities
			.filter<MarketBuildingEntity>((entity) => entity.type === 'market-stall')
			.filter(
				(marketStall) =>
					marketStall.inventory.availableOf(marketStall.material) +
						marketStall.inventory.reservedIncomingOf(marketStall.material) <
					marketStall.material.stack,
			)
			.map((marketStall) => ({
				entity: marketStall,
				material: marketStall.material,
				quantity: marketStall.material.stack,
			}));

		// @TODO
		// - Make a map of suppliers, instead of finding them again and again in loop
		// - Use path distance instead of euclidian distance

		const supplyDemand = [...demandInFactories, ...demandInMarketStalls]
			.map<SupplyDemand | null>((demand) => {
				const supplier = game.entities
					.filter<FactoryBuildingEntity>((entity) => entity.type === 'factory')
					.filter((factory) =>
						factory.$blueprint.get()?.products.some(({ material }) => material === demand.material),
					)
					.filter((factory) => factory.inventory.availableOf(demand.material) >= demand.quantity)
					.map<{ entity: FactoryBuildingEntity; distance: number }>((factory) => ({
						entity: factory,
						distance: factory.$$location.get().euclideanDistanceTo(entity.$$location.get()),
					}))
					.sort((a, b) => a.distance - b.distance)
					.shift();
				if (!supplier) {
					return null;
				}
				return { ...demand, supplier: supplier.entity, distance: supplier.distance };
			})
			.filter((supplyDemand): supplyDemand is SupplyDemand => !!supplyDemand)
			.sort((a, b) => a.distance - b.distance)
			.shift();

		if (!supplyDemand) {
			throw new Error(`There are no hauling jobs to do`);
		}

		const tradeOrder = new TradeOrder(
			{
				owner: supplyDemand.supplier.owner,
				inventory: supplyDemand.supplier.inventory,
				money: 0,
				cargo: [
					{
						material: supplyDemand.material,
						quantity: supplyDemand.quantity,
					},
				],
			},
			{
				owner: supplyDemand.entity.owner,
				inventory: supplyDemand.entity.inventory,
				money: supplyDemand.material.value * supplyDemand.quantity,
				cargo: [],
			},
		);

		Object.assign(blackboard, { tradeOrder, from: supplyDemand.supplier, to: supplyDemand.entity });

		supplyDemand.supplier.inventory.makeReservation(tradeOrder);
		supplyDemand.entity.inventory.makeReservation(tradeOrder);
	}),
	new ExecutionNode<
		EntityBlackboard & { tradeOrder: TradeOrder; from: TradeEntityI; to: TradeEntityI }
	>('Walk to supplier', ({ game, entity, from }) => {
		entity.$status.set(`Going to pick up materials from ${from}`);
		return walkEntityToEntity(game, entity, from);
	}),
	new ExecutionNode<
		EntityBlackboard & { tradeOrder: TradeOrder; from: TradeEntityI; to: TradeEntityI }
	>('Load goods', ({ entity, tradeOrder }) => {
		tradeOrder.inventory1.cancelReservation(tradeOrder);
		tradeOrder.inventory1.changeMultiple(
			tradeOrder.stacks1.map(({ quantity, material }) => ({
				quantity: -quantity,
				material,
			})),
		);
		entity.inventory.changeMultiple(tradeOrder.stacks1);
	}),
	new ExecutionNode<
		EntityBlackboard & { tradeOrder: TradeOrder; from: TradeEntityI; to: TradeEntityI }
	>('Walk to deliver', ({ game, entity, to }) => {
		entity.$status.set(`Delivering materials to ${to}`);
		return walkEntityToEntity(game, entity, to);
	}),
	new ExecutionNode<
		EntityBlackboard & { tradeOrder: TradeOrder; from: TradeEntityI; to: TradeEntityI }
	>('Unload goods', ({ entity, tradeOrder }) => {
		entity.inventory.changeMultiple(
			tradeOrder.stacks1.map(({ quantity, material }) => ({
				quantity: -quantity,
				material,
			})),
		);
		tradeOrder.inventory2.changeMultiple(tradeOrder.stacks1);
		tradeOrder.inventory2.cancelReservation(tradeOrder);
	}),
);
