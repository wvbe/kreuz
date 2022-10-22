import { Event } from '../classes/Event.ts';
import { ProgressingNumericValue } from '../classes/ProgressingNumericValue.ts';

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
export class Need extends ProgressingNumericValue {
	public readonly id: string;
	public constructor(id: string, initial: number, label: string, delta: number, debug?: boolean) {
		super(initial, { delta }, label, debug);
		this.id = id;
	}
}
