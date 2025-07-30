import { EventedNumericValue } from '../../events/EventedNumericValue';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component have a wallet.
 */
export const wealthComponent = new EcsComponent<
	{
		wealth: number;
	},
	{
		/**
		 * The number of moneys that this entity has on them.
		 */
		wallet: EventedNumericValue;
	}
>(
	(entity) => entity.wallet instanceof EventedNumericValue,
	(entity, options) => {
		entity.wallet = new EventedNumericValue(options.wealth, 'wealthComponent wallet');
	},
);
