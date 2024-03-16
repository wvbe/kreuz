import { type Material } from '../../../inventory/Material.ts';
import { LogisticsExchange } from './LogisticsExchange.ts';

export class LogisticsExchangeByMaterial {
	#exchanges = new Map<Material, LogisticsExchange>();

	public get(material: Material) {
		let exchange = this.#exchanges.get(material);
		if (!exchange) {
			exchange = new LogisticsExchange(material);
			this.#exchanges.set(material, exchange);
		}
		return exchange;
	}
	public forEach(callback: (exchange: LogisticsExchange) => void) {
		this.#exchanges.forEach(callback);
	}
}
