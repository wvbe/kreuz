import { type Material } from '../../../inventory/Material.ts';
import { TradeFlowExchange } from './TradeFlowExchange.ts';

export class TradeFlowExchangeByMaterial {
	#exchanges = new Map<Material, TradeFlowExchange>();

	public get(material: Material) {
		let exchange = this.#exchanges.get(material);
		if (!exchange) {
			exchange = new TradeFlowExchange(material);
			this.#exchanges.set(material, exchange);
		}
		return exchange;
	}
	public forEach(callback: (exchange: TradeFlowExchange) => void) {
		this.#exchanges.forEach(callback);
	}
}
