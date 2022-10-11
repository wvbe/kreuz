import { type Game } from '../../mod.ts';
import { EventedValue } from '../classes/EventedValue.ts';

export class Need extends EventedValue<number> {
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

	private getDecayTimeToValue(value: number) {
		return (this.current - value) / this.#decay;
	}

	/**
	 * Make aware of game and time.
	 */
	public attach(game: Game) {
		let destroy: null | (() => void) = null;

		const setTimeoutToDepletion = () => {
			if (destroy) {
				destroy();
				destroy = null;
			}
			const toZero = this.getDecayTimeToValue(0);
			if (toZero <= 0) {
				return;
			}
			game.time.setTimeout(() => {
				this.set(0);
			}, toZero);
		};
		setTimeoutToDepletion();
		this.on(() => {
			setTimeoutToDepletion();
		});
	}
}
