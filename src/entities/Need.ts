import { Event } from '../classes/Event.ts';
import { EventedNumericValue } from '../classes/EventedNumericValue.ts';
import type Game from '../Game.ts';
import { type DestroyerFn } from '../types.ts';

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
export class Need extends EventedNumericValue {
	#decay: number;

	public constructor(initial: number, label: string, decayPerTick: number, debug?: boolean) {
		super(initial, label, debug);
		this.#decay = decayPerTick;
	}

	/**
	 * Set the new value to whatever it was minus the decay-over-time for a certain amount of
	 * time passed.
	 *
	 * Will trigger an update event.
	 */
	public applyDecay(timePassed: number): void {
		this.set(Math.max(0, this.current - this.#decay * timePassed));
	}

	public setDecay(decayPerTick: number): void {
		this.#decay = decayPerTick;
		this.$nextSignificantValueChange.emit();
	}

	/**
	 * @deprecated
	 */
	private getDecayTimeToValue(value: number): number {
		return (this.current - value) / this.#decay;
	}

	/**
	 * This event means that the next need value that is significant (because someone is waiting for
	 * it) has changed -- probably because a new listener was added or removed.
	 */
	private $nextSignificantValueChange = new Event('Need $nextSignificantValueChange');

	/**
	 * A specialization of EventedNumericValue#onBetween, because it emits an event that will
	 * cause to reset some timers.
	 */
	public onBetween(...args: Parameters<EventedNumericValue['onBetween']>): DestroyerFn {
		const destroy = super.onBetween(...args);
		this.$nextSignificantValueChange.emit();
		return destroy;
	}

	/**
	 * A specialization of EventedNumericValue#onceBetween, because it emits an event that will
	 * cause to reset some timers.
	 */
	public onceBetween(...args: Parameters<EventedNumericValue['onceBetween']>): DestroyerFn {
		const destroy = super.onceBetween(...args);
		this.$nextSignificantValueChange.emit();
		return destroy;
	}

	/**
	 * Set a timeout to update the current value at the earliest significant (= listened to) time.
	 * This is helpful to avoid a tonne of micro-updates that nobody is listening for.
	 *
	 * Returns a function to cancel the update
	 *
	 * @deprecated Not maintainable in combination with .onBetween listeners etc. Should probably just
	 * take a (performance) hit and simplify. Decay does not have to be computed every tick per se.
	 */
	#setUpdateTimeoutToNearest(game: Game): null | DestroyerFn {
		if (this.#decay <= 0) {
			// If this need does not decay, no need for a timer.
			return null;
		}
		const nextSignificantRange = this.getWatchedRanges
			.filter((range) => range.max < this.current)
			.sort((a, b) => b.max - a.max)[0];
		const nextSignificantValue = nextSignificantRange?.max || 0;
		const timeToNextSignificantValue = this.getDecayTimeToValue(nextSignificantValue);
		if (timeToNextSignificantValue <= 0) {
			return null;
		}
		return game.time.setTimeout(() => {
			this.set(nextSignificantValue);
		}, timeToNextSignificantValue);
	}

	/**
	 * Make aware of game and time.
	 */
	public attach(game: Game): DestroyerFn {
		let removeUpdateTimeout = this.#setUpdateTimeoutToNearest(game);
		const cancelNextSignificantValueChangeListener = this.$nextSignificantValueChange.on(() => {
			removeUpdateTimeout?.();
			removeUpdateTimeout = this.#setUpdateTimeoutToNearest(game);
		});
		const cancelValueChangeListener = this.on(() => {
			removeUpdateTimeout?.();
			removeUpdateTimeout = this.#setUpdateTimeoutToNearest(game);
		});
		return () => {
			cancelNextSignificantValueChangeListener();
			cancelValueChangeListener();
		};
	}
}
