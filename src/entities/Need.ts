import { type Game } from '../../mod.ts';
import { Event } from '../classes/Event.ts';
import { EventedNumericValue } from '../classes/EventedNumericValue.ts';

export class Need extends EventedNumericValue {
	#decay: number;

	constructor(initial: number, label: string, decayPerTick: number, debug?: boolean) {
		super(initial, label, debug);
		this.#decay = decayPerTick;
	}

	/**
	 * Set the new value to whatever it was minus the decay-over-time for a certain amount of
	 * time passed.
	 *
	 * Will trigger an update event.
	 */
	public applyDecay(timePassed: number) {
		this.set(Math.max(0, this.current - this.#decay * timePassed));
	}

	/**
	 * @deprecated
	 */
	private getDecayTimeToValue(value: number) {
		return (this.current - value) / this.#decay;
	}

	/**
	 * This event means that the next need value that is significant (because someone is waiting for
	 * it) has changed -- probably because a new listener was added or removed.
	 */
	private $nextSignificantValueChange = new Event('Need $nextSignificantValueChange');

	public onBetween(...args: Parameters<EventedNumericValue['onBetween']>): () => void {
		const destroy = super.onBetween(...args);
		this.$nextSignificantValueChange.emit();
		return destroy;
	}

	public onceBetween(...args: Parameters<EventedNumericValue['onceBetween']>): () => void {
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
	#setUpdateTimeoutToNearest(game: Game): null | (() => void) {
		const nextSignificantRange = this.getWatchedRanges
			.filter((range) => range.max < this.current)
			.sort((a, b) => b.max - a.max)[0];
		// if (!nextSignificantRange) {
		// 	return null;
		// }
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
	public attach(game: Game) {
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
