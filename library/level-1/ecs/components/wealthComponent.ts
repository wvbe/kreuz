import { EventedNumericValue } from '../../events/EventedNumericValue.ts';
import { Inventory } from '../../inventory/Inventory.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const wealthComponent = new EcsComponent<
	{
		wealth: number;
	},
	{
		wallet: EventedNumericValue;
	}
>(
	(entity) => entity.wallet instanceof EventedNumericValue,
	(entity, options) => {
		entity.wallet = new EventedNumericValue(options.wealth, 'wealthComponent wallet');
	},
);
