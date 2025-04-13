import { expect } from '@jest/globals';
import { LogisticsExchange } from './LogisticsExchange';
import { personArchetype } from '../../../lib';
import { importExportComponent } from '../../components/importExportComponent';

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

describe('LogisticsExchange', () => {
	it('No demand', () => {
		const exchange = new LogisticsExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 10);
		expect(exchange.getLargestTransferDeal()).toBeNull();
	});
	it('No supply', () => {
		const exchange = new LogisticsExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(destination, -10);
		expect(exchange.getLargestTransferDeal()).toBeNull();
	});
	it('One match', () => {
		const exchange = new LogisticsExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 10);
		exchange.updateSupplyDemand(destination, -10);
		expect(exchange.getLargestTransferDeal()).toEqual({
			supplier,
			destination,
			material,
			quantity: 10,
		});
	});
	it('Partial match (too little demand)', () => {
		const exchange = new LogisticsExchange<EcsEntity>(material);
		exchange.updateSupplyDemand(supplier, 10);
		exchange.updateSupplyDemand(destination, -5);
		expect(exchange.getLargestTransferDeal()).toEqual({
			supplier,
			destination,
			material,
			quantity: 5,
		});
	});
	it('Partial match (too little supply)', () => {
		const exchange = new LogisticsExchange<EcsEntity>(material);
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
