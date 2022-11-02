import { type AttachableI } from '../classes/Attachable.ts';
import { Event } from '../classes/Event.ts';
import { EventedNumericValue } from '../classes/EventedNumericValue.ts';
import type Game from '../Game.ts';
import { type DestroyerFn } from '../types.ts';

type ProgressingNumericValueOptions = {
	min?: number;
	max?: number;
	delta: number;
	granularity?: number;
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
export class ProgressingNumericValue extends EventedNumericValue implements AttachableI {
	/*
	 * implement AttachableI:
	 */
	protected $attach = new Event<[Game]>(`${this.constructor.name} $attach`);
	public attach(game: Game) {
		this.$attach.emit(game);
	}
	protected $detach = new Event(`${this.constructor.name} $detach`);
	public detach() {
		this.$detach.emit();
	}

	/*
	 * NEED
	 */

	#delta: number;
	#min: number;
	#max: number;
	#granularity: number;

	/**
	 * This event means that the next need value that is significant (because someone is waiting for
	 * it) has changed -- probably because a new listener was added or removed.
	 *
	 * The value that is passed along signifies wether or not extra compensation is expected for
	 * the time elapsed in the cancelled timeout -- or more precisely at which decay rate.
	 */
	private readonly $recalibrate = new Event<[number]>(`${this.constructor.name} $recalibrate`);

	public readonly label: string;

	public constructor(
		initial: number,
		options: ProgressingNumericValueOptions,
		label: string
	) {
		super(initial, label);
		this.label = label;
		this.#delta = options.delta;
		this.#min = options.min || 0;
		this.#max = options.max || 1;
		this.#granularity = options.granularity || 0.001;
		if (this.#min >= this.#max) {
			throw new Error(
				`The lower boundary of a ProgressingNumericValue must be less than the upper boundary`,
			);
		}

		/**
		 * Make aware of game and time.
		 */
		this.$attach.on((game) => {
			// We want an update every {{granularity}} of the 0-1 range that this need is on.
			const granularity = this.#granularity;

			// If cancelInterval is null, the system is not updating at an interval.
			// Calling cancelInterval returns the amount of time left on the last timeout.
			let cancelInterval: DestroyerFn<number> | null = null;

			const setTimeout = (delay: number) => {
				delay = Math.abs(delay);
				if (delay < 1) {
					console.warn(`Warning! Setting a very short timer of ${delay} ticks`);
				} else if (delay === Infinity) {
					// @NOTE This timer could have been avoided altogether. Whenever this warning is
					// shown, please fix the root cause of the timer.
					//
					// For the time being we will also return early, rather than throw an error later.
					console.warn(
						`Warning! The timer is set to "never" (Infinity), with delta ${this.#delta}`,
					);
					return;
				}
				const lastTime = game.time.now;

				const cancelTimeout = game.time.setTimeout(() => {
					const timePassed = game.time.now - lastTime;
					if (this.#delta !== 0) {
						setTimeout(granularity / this.#delta);
					}
					this.applyDeltaForTimePassed(timePassed);
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
				const hasReachedMaxProgression =
					this.#delta === 0 ||
					(this.#delta < 0 && value <= this.#min) ||
					(this.#delta > 0 && value >= this.#max);
				if (hasReachedMaxProgression && cancelInterval) {
					cancelInterval();
				} else if (!cancelInterval && !hasReachedMaxProgression) {
					// If interval was disabled but a value is "started up" again, set the timeout too
					setTimeout(granularity / this.#delta);
				}
			});

			const stopListeningForDecayChanges = this.$recalibrate.on(() => {
				setTimeout(cancelInterval?.() || granularity / this.#delta);
			});

			if (this.#delta !== 0) {
				setTimeout(granularity / this.#delta);
			}

			this.$detach.once(() => {
				stopListeningForValueChanges();
				stopListeningForDecayChanges();
				cancelInterval?.();
			});
		});
	}

	/**
	 * Public getter for the delta.
	 *
	 * Delta can only be changed using .setDelta()
	 */
	public get delta() {
		return this.#delta;
	}

	/**
	 * Set the new value to whatever it was minus the decay-over-time for a certain amount of
	 * time passed.
	 *
	 * Will trigger an update event.
	 */
	private applyDeltaForTimePassed(timePassed: number, skipUpdate?: boolean): void {
		this.set(this.current + this.#delta * timePassed, skipUpdate);
	}

	/**
	 * Same as any eventedvalue, sets to a specific value and maybe emit an update event.
	 *
	 * Will also restrict value to within the min/max bounds (this.#min, this.#max)
	 */
	public set(value: number, skipUpdate?: boolean) {
		return super.set(Math.min(this.#max, Math.max(this.#min, value)), skipUpdate);
	}

	public setDelta(newDelta: number): void {
		const oldDelta = this.#delta;
		this.#delta = newDelta;
		this.$recalibrate.emit(oldDelta);
	}
}
