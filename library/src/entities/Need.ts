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

	public $detach = new Event(`Need $detach`);

	public readonly id: string;

	public readonly label: string;

	public constructor(
		id: string,
		initial: number,
		label: string,
		decayPerTick: number,
		debug?: boolean,
	) {
		super(initial, label, debug);
		this.id = id;
		this.label = label;
		this.#decay = decayPerTick;
	}

	/**
	 * Set the new value to whatever it was minus the decay-over-time for a certain amount of
	 * time passed.
	 *
	 * Will trigger an update event.
	 */
	private applyDecay(timePassed: number, skipUpdate?: boolean): void {
		const value = Math.max(0, this.current - this.#decay * timePassed);
		this.set(value, skipUpdate);
	}

	public setDecay(decayPerTick: number): void {
		const oldDecay = this.#decay;
		this.#decay = decayPerTick;
		this.$recalibrate.emit(oldDecay);
	}

	/**
	 * This event means that the next need value that is significant (because someone is waiting for
	 * it) has changed -- probably because a new listener was added or removed.
	 *
	 * The value that is passed along signifies wether or not extra compensation is expected for
	 * the time elapsed in the cancelled timeout -- or more precisely at which decay rate.
	 */
	$recalibrate = new Event<[number]>('Need $recalibrate');

	/**
	 * Make aware of game and time.
	 */
	public attach(game: Game): void {
		// We want an update every {{granularity}} of the 0-1 range that this need is on.
		const granularity = 0.001;

		// If cancelInterval is null, the system is not updating at an interval.
		// Calling cancelInterval returns the amount of time left on the last timeout.
		let cancelInterval: DestroyerFn<number> | null = null;

		const setTimeout = (delay: number) => {
			const lastTime = game.time.now;

			const cancelTimeout = game.time.setTimeout(() => {
				const timePassed = game.time.now - lastTime;
				setTimeout(granularity / this.#decay);
				this.applyDecay(timePassed);
				// Apply decay _after_ setting new timeout, so that an event listener can unset the
				// timeout again if the value is zero
			}, delay);

			cancelInterval = () => {
				const timeLeft = cancelTimeout();
				cancelInterval = null;
				return timeLeft;
			};
		};

		const stopListeningForValueChanges = this.on((value) => {
			if (value <= 0 && cancelInterval) {
				cancelInterval();
			} else if (!cancelInterval && value > 0) {
				// If interval was disabled but a value is "started up" again, set the timeout too
				setTimeout(granularity / this.#decay);
			}
		});

		const stopListeningForDecayChanges = this.$recalibrate.on(() => {
			setTimeout(cancelInterval?.() || granularity / this.#decay);
		});

		setTimeout(granularity / this.#decay);

		this.$detach.once(() => {
			stopListeningForValueChanges();
			stopListeningForDecayChanges();
			cancelInterval?.();
		});
	}

	public detach() {
		this.$detach.emit();
	}
}
