import { type Material } from '../../../inventory/Material.ts';
import { EcsEntity } from '../../types.ts';
import { TradeFlowDeal } from './types.ts';
import { type TradeFlowOffer, type TradeFlowEntity } from './types.ts';

/**
 * A space in which supply and demand for a specific {@link Material} is recorded. Whenever you like,
 * use {@link TradeFlowExchange.getLargestTransferDeal} to find the biggest cargo haul available; this
 * produces a {@link TradeFlowDeal} with all the necessary information to carry out the trade.
 */
export class TradeFlowExchange<EntityGeneric extends EcsEntity = TradeFlowEntity> {
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
	): TradeFlowDeal<EntityGeneric> | null {
		const biggestSupply = Array.from(
			this.#parties.entries(),
		).reduce<TradeFlowOffer<EntityGeneric> | null>((result, [entity, quantity]) => {
			if (
				quantity >= minimumAmount &&
				quantity <= maximumAmount &&
				quantity > (result?.quantityOnOffer || 0)
			) {
				return { entity, quantityOnOffer: quantity };
			}
			return result;
		}, null);
		if (!biggestSupply) {
			// Nobody has anything to offer
			return null;
		}

		const biggestDemand = Array.from(
			this.#parties.entries(),
		).reduce<TradeFlowOffer<EntityGeneric> | null>((result, [entity, quantity]) => {
			if (
				quantity <= -minimumAmount &&
				quantity >= -maximumAmount &&
				quantity < (result?.quantityOnOffer || 0)
			) {
				return { entity, quantityOnOffer: quantity };
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
	public excludeDealFromRecords(deal: TradeFlowDeal<EntityGeneric>) {
		this.#parties.set(deal.supplier, this.#parties.get(deal.supplier)! - deal.quantity);
		this.#parties.set(deal.destination, this.#parties.get(deal.destination)! + deal.quantity);
	}
}
