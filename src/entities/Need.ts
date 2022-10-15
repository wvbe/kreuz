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
	public applyDecay(timePassed: number, skipUpdate?: boolean): void {
		const value = Math.max(0, this.current - this.#decay * timePassed);
		if (value < 1e-12) {
			// Javascript and small numbers are no bueno. To stay sane we shall assume everything
			// with more than 12 decimal zeroes is the same as zero.
			this.set(0, skipUpdate);
		} else {
			this.set(value, skipUpdate);
		}
	}

	public setDecay(decayPerTick: number): void {
		const oldDecay = this.#decay;
		this.#decay = decayPerTick;
		this.#$nextSignificantValueChange.emit(oldDecay);
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
	 *
	 * The value that is passed along signifies wether or not extra compensation is expected for
	 * the time elapsed in the cancelled timeout -- or more precisely at which decay rate.
	 */
	#$nextSignificantValueChange = new Event<[number]>('Need $nextSignificantValueChange');

	/**
	 * A specialization of EventedNumericValue#onBetween, because it emits an event that will
	 * cause to reset some timers.
	 */
	public onBetween(...args: Parameters<EventedNumericValue['onBetween']>): DestroyerFn {
		const destroy = super.onBetween(...args);
		this.#$nextSignificantValueChange.emit(0);
		return destroy;
	}

	/**
	 * A specialization of EventedNumericValue#onceBetween, because it emits an event that will
	 * cause to reset some timers.
	 */
	public onceBetween(...args: Parameters<EventedNumericValue['onceBetween']>): DestroyerFn {
		const destroy = super.onceBetween(...args);
		this.#$nextSignificantValueChange.emit(0);
		return destroy;
	}

	/**
	 * The ticks of time between emitted decay to the value, if you choose to poll for it. Use
	 * the destroyer function of .setPollingInterval to cancel, or set the interval to null.
	 */
	#pollingInterval: number | null = null;

	/**
	 * Tell the system that we're interested in value updates at a regular
	 * interval, for example because we're showing a live UI view of this value.
	 *
	 * @BUG When setPollingInterval is set, the next applyDecay does not take into account the time
	 * that was already consumed by the forfeited timeout. This causes UI to show a more optimistic
	 * need value than appropriate when setPollingInterval is used to subscribe to the value from React.
	 *                                           -- maybe fixed? <3
	 */
	public setPollingInterval(interval: number | null): DestroyerFn {
		this.#pollingInterval = interval;
		// The  timeout is cancelled, not rolled back, so emit TRUE to let downstream know that
		// the decay already accumulated on the timeout must be applied
		this.#$nextSignificantValueChange.emit(this.#decay);
		return () => {
			this.#pollingInterval = null;
		};
	}

	#getTimeToNextSignificantValue(): number {
		if (this.#pollingInterval !== null) {
			return this.#pollingInterval;
		}
		if (this.#decay <= 0) {
			// If this need does not decay, no need for a timer.
			return Infinity;
		}
		const nextSignificantRange = this.getWatchedRanges
			.filter((range) => range.max < this.current)
			.sort((a, b) => b.max - a.max)[0];
		const nextSignificantValue = nextSignificantRange?.max || 0;
		const timeToNextSignificantValue = this.getDecayTimeToValue(nextSignificantValue);
		return timeToNextSignificantValue;
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
	#setUpdateTimeoutToNearest(game: Game): null | DestroyerFn<number> {
		const timeToNextSignificantValue = this.#getTimeToNextSignificantValue();
		if (timeToNextSignificantValue <= 0 || timeToNextSignificantValue >= Infinity) {
			return null;
		}
		return game.time.setTimeout(() => {
			this.applyDecay(timeToNextSignificantValue);
		}, timeToNextSignificantValue);
	}

	/**
	 * Make aware of game and time.
	 */
	public attach(game: Game): DestroyerFn {
		let removeUpdateTimeout = this.#setUpdateTimeoutToNearest(game);
		const cancelNextSignificantValueChangeListener = this.#$nextSignificantValueChange.on(
			(timerDecayRate) => {
				const timerTimePassed = removeUpdateTimeout?.() || 0;
				if (timerDecayRate && timerTimePassed) {
					console.log('Fast-forwarding decay', timerTimePassed);
					const value = Math.max(0, this.current - timerDecayRate * timerTimePassed);
					this.set(value);
				}
				removeUpdateTimeout = this.#setUpdateTimeoutToNearest(game);
			},
		);
		const cancelValueChangeListener = this.on(() => {
			removeUpdateTimeout?.();
			removeUpdateTimeout = this.#setUpdateTimeoutToNearest(game);
		});
		return () => {
			cancelNextSignificantValueChangeListener();
			cancelValueChangeListener();
			removeUpdateTimeout?.();
		};
	}
}
