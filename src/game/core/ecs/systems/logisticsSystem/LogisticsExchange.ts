import { type Material } from '../../../inventory/Material';
import { EcsEntity } from '../../types';
import { LogisticsDeal, type LogisticsEntity, type LogisticsOffer } from './types';

/**
 * A space in which supply and demand for a specific {@link Material} is recorded. Whenever you like,
 * use {@link LogisticsExchange.getLargestTransferDeal} to find the biggest cargo haul available; this
 * produces a {@link LogisticsDeal} with all the necessary information to carry out the trade.
 */
export class LogisticsExchange<EntityGeneric extends EcsEntity = LogisticsEntity> {
	#parties = new Map<EntityGeneric, number>();

	public readonly material: Material;

	public constructor(material: Material) {
		this.material = material;
	}

	/**
	 * - Positive number means the entity is looking to sell the material
	 * - Negative number means the entity is looking to buy of the material
	 */
	public updateSupplyDemand(entity: EntityGeneric, quantityOnOffer: number) {
		this.#parties.set(entity, quantityOnOffer);
	}

	/**
	 * Returns the largest quantity of supply and demand between two parties.
	 */
	public getLargestTransferDeal(
		minimumAmount: number = 1,
		maximumAmount: number = this.material.stack,
	): LogisticsDeal<EntityGeneric> | null {
		const biggestSupply = Array.from(
			this.#parties.entries(),
		).reduce<LogisticsOffer<EntityGeneric> | null>((result, [entity, quantity]) => {
			if (
				quantity >= minimumAmount &&
				Math.min(maximumAmount, quantity) > (result?.quantityOnOffer || 0)
			) {
				return {
					entity,
					quantityOnOffer: Math.min(maximumAmount, quantity),
				};
			}
			return result;
		}, null);
		if (!biggestSupply) {
			// Nobody has anything to offer
			return null;
		}

		const biggestDemand = Array.from(
			this.#parties.entries(),
		).reduce<LogisticsOffer<EntityGeneric> | null>((result, [entity, quantity]) => {
			if (
				quantity <= -minimumAmount &&
				Math.max(-maximumAmount, quantity) < (result?.quantityOnOffer || 0)
			) {
				return {
					entity,
					quantityOnOffer: Math.max(-maximumAmount, quantity),
				};
			}
			return result;
		}, null);

		if (!biggestDemand) {
			// Nobody has anything to offer
			return null;
		}

		const quantity = Math.min(biggestSupply.quantityOnOffer, -biggestDemand.quantityOnOffer);
		return {
			supplier: biggestSupply.entity,
			destination: biggestDemand.entity,
			material: this.material,
			quantity,
		};
	}

	/**
	 * If a deal is accepted, update the records known to this exchange so that the deal
	 * does not get suggested again for the same materials.
	 */
	public excludeDealFromRecords(deal: LogisticsDeal<EntityGeneric>) {
		this.#parties.set(deal.supplier, this.#parties.get(deal.supplier)! - deal.quantity);
		this.#parties.set(deal.destination, this.#parties.get(deal.destination)! + deal.quantity);
	}
}
