import { expect } from '@test';
import { TradeFlowExchange } from './TradeFlowExchange.ts';
import { EcsEntity, Material } from '@lib';
import { importExportComponent } from '../../components/importExportComponent.ts';

const material = new Material(`TestMaterial`, {
	symbol: `📦`,
	stackSize: 10,
	hydration: 0,
	nutrition: 0,
	toxicity: 0,
	value: 0,
});

const supplier = { id: 'supplier' };
const destination = { id: 'demand' };

Deno.test('TradeFlowExchange', async (test) => {
	await test.step('No demand', () => {
		const exchange = new TradeFlowExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 10);
		expect(exchange.getLargestTransferDeal()).toBeNull();
	});
	await test.step('No supply', () => {
		const exchange = new TradeFlowExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(destination, -10);
		expect(exchange.getLargestTransferDeal()).toBeNull();
	});
	await test.step('One match', () => {
		const exchange = new TradeFlowExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 10);
		exchange.updateSupplyDemand(destination, -10);
		expect(exchange.getLargestTransferDeal()).toEqual({
			supplier,
			destination,
			material,
			quantity: 10,
		});
	});
	await test.step('Partial match (too little demand)', () => {
		const exchange = new TradeFlowExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 10);
		exchange.updateSupplyDemand(destination, -5);
		expect(exchange.getLargestTransferDeal()).toEqual({
			supplier,
			destination,
			material,
			quantity: 5,
		});
	});
	await test.step('Partial match (too little supply)', () => {
		const exchange = new TradeFlowExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 5);
		exchange.updateSupplyDemand(destination, -10);
		expect(exchange.getLargestTransferDeal()).toEqual({
			supplier,
			destination,
			material,
			quantity: 5,
		});
	});
});
