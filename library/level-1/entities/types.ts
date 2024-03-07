import { type AttachableI } from '../classes/Attachable.ts';
import { Collection } from '../events/Collection.ts';
import { type EventedValue } from '../events/EventedValue.ts';
import { TradeOrder } from '../classes/TradeOrder.ts';
import { type SaveEntityJson } from './entity.ts';
import { type CoordinateI } from '../types.ts';
import { SaveJsonContext } from '../types-savedgame.ts';

export interface EntityI extends AttachableI {
	/**
	 * A more stable name for a class extension of Entity than `this.constructor.name`
	 *
	 * For example:
	 *   "guard"
	 *
	 * @deprecated This any all other entity types _should_ over time be replaced by an ECS system.
	 * Checking against an entity type then becomes unnecessary. This is a large refactoring, not
	 * planned for any time soon.
	 */
	type: string;

	/**
	 * @deprecated This value migth not be as unique as you think
	 *
	 * For example:
	 *   "test-1"
	 */
	id: string;

	/**
	 * An emoji that makes the entity more recognizable at a glance.
	 *
	 * For example:
	 *   "🎅" (Santa emoji)
	 */
	icon: string;

	/**
	 * The human-readable name for this entity.
	 *
	 * For example:
	 *   "Hans McPannekoek"
	 */
	name: string;

	/**
	 * A recognizable string that represents this entity, even if a lot of context is missing. By
	 * default it is a combination of the icon and name.
	 *
	 * For example:
	 *   "🎅 Hans McPannekoek"
	 */
	label: string;

	/**
	 * A short description of what this entity is or does. For example, they are the bailiff or they're
	 * guarding a place.
	 *
	 * for example:
	 *   "Delivering a pancake"
	 */
	$status: EventedValue<null | string>;

	/**
	 * The location of this entity, if it is standing on any particular tile.
	 */
	$$location: EventedValue<CoordinateI>;

	toSaveJson(context: SaveJsonContext): SaveEntityJson;
}

/**
 * Any entity capable of trading.
 */
export interface TradeEntityI extends EntityI {
	wallet: EventedValue<number>;
	$log: Collection<TradeOrder>;
}
