import { Event } from '../classes/Event.ts';
import {
	ProgressingNumericValue,
	type SavedProgressingNumericValueI,
} from '../classes/ProgressingNumericValue.ts';
import { SaveableObject } from '../types-savedgame.ts';

export type SavedNeedI = SavedProgressingNumericValueI & {
	id: string;
};

/**
 * A need represents the urgency with which a personnal requirement needs to be fulfilled. In most
 * cases, 0 means that there is an urgent problem, whereas "food = 1" means this entity is feeling
 * very satisfied.
 *
 * @remarks
 * Needs are a special type of evented numeric values. They decay all the time, but for performance
 * reasons they shouldn't tick every time. Instead, with a known decay-per-time, a timeout is set
 * for the first time that someone is expected to care -- for example when it reaches zero, or when
 * it reaches a range that is being watched with Need#onBetween/Need#onceBetween.
 */
export class Need extends ProgressingNumericValue implements SaveableObject<SavedNeedI> {
	public readonly id: string;
	public constructor(id: string, initial: number, label: string, delta: number, debug?: boolean) {
		super(initial, { delta }, label, debug);
		this.id = id;
	}

	/**
	 * This event means that the next need value that is significant (because someone is waiting for
	 * it) has changed -- probably because a new listener was added or removed.
	 *
	 * The value that is passed along signifies wether or not extra compensation is expected for
	 * the time elapsed in the cancelled timeout -- or more precisely at which decay rate.
	 */
	$recalibrate = new Event<[number]>('Need $recalibrate');

	public serializeToSaveJson(): SavedNeedI {
		return {
			...super.serializeToSaveJson(),
			id: this.id,
		};
	}
}
