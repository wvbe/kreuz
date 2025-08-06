import { type AttachableI } from '../classes/Attachable';
import type Game from '../Game';
import { type DestroyerFn } from '../types';
import { Event } from './Event';
import { EventedNumericValue } from './EventedNumericValue';

type ProgressingNumericValueOptions = {
	/**
	 * The lower boundary to which the value can be set.
	 */
	min?: number;
	/**
	 * The upper boundary to which the value can be set.
	 */
	max?: number;
	/**
	 * The change that is applied to this value every time tick. A positive number means the
	 * value increases over time, while a negative number means the value lowers over time.
	 *
	 * The delta can never cause the value to exceed the min/max boundaries.
	 */
	delta: number;
	/**
	 * The frequency with which updates should happen. A small number means a higher granularity and
	 * more updates. Defaults to 1/100th of the difference between min/max, in other words defaults
	 * to 1%.
	 */
	granularity?: number;
};

export class ProgressingNumericValue extends EventedNumericValue implements AttachableI {
	/*
	 * implement AttachableI:
	 */
	protected $attach = new Event<[Game]>(`${this.constructor.name} $attach`);
	public async attach(game: Game) {
		await this.$attach.emit(game);
	}
	protected $detach = new Event(`${this.constructor.name} $detach`);
	public async detach() {
		await this.$detach.emit();
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
	public readonly $recalibrate = new Event(`${this.constructor.name} $recalibrate`);

	public readonly label: string;

	public constructor(initial: number, options: ProgressingNumericValueOptions, label: string) {
		super(initial, label);
		this.label = label;
		this.#delta = options.delta;
		this.#min = options.min ?? 0;
		this.#max = options.max ?? 1;
		this.#granularity = options.granularity || 0.01 * (this.#max - this.#min);
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

			const setGameTimeoutToNextUpdate = (delay: number) => {
				delay = Math.abs(delay);
				if (delay < 1) {
					console.warn(
						`Warning! Timer "${this.label}" has a very short delay of ${delay} ticks`,
					);
				} else if (delay === Infinity) {
					debugger;
					// @NOTE This timer could have been avoided altogether. Whenever this warning is
					// shown, please fix the root cause of the timer.
					//
					// For the time being we will also return early, rather than throw an error later.
					console.warn(
						`Warning! Timer "${this.label}" is set to "never" (Infinity), with delta ${
							this.#delta
						}`,
					);
					return;
				}
				const lastTime = game.time.now;

				const cancelTimeout = game.time.setTimeout(async () => {
					const timePassed = game.time.now - lastTime;
					if (this.#delta !== 0) {
						setGameTimeoutToNextUpdate(granularity / this.#delta);
					}
					if (timePassed > 0) {
						await this.applyDeltaForTimePassed(timePassed);
					}
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
					setGameTimeoutToNextUpdate(granularity / this.#delta);
				}
			});

			const stopListeningForDecayChanges = this.$recalibrate.on(() => {
				const timeLeft = cancelInterval?.() || granularity / this.#delta;
				if (timeLeft < Infinity) {
					setGameTimeoutToNextUpdate(timeLeft);
				}
			});

			if (this.#delta !== 0) {
				setGameTimeoutToNextUpdate(granularity / this.#delta);
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
	private async applyDeltaForTimePassed(timePassed: number, skipUpdate?: boolean): Promise<void> {
		await this.set(this.current + this.#delta * timePassed, skipUpdate);
	}

	/**
	 * Same as any eventedvalue, sets to a specific value and maybe emit an update event.
	 *
	 * Will also restrict value to within the min/max bounds (this.#min, this.#max)
	 */
	public async set(value: number, skipUpdate?: boolean): Promise<void> {
		await super.set(Math.min(this.#max, Math.max(this.#min, value)), skipUpdate);
	}

	public async setDelta(newDelta: number): Promise<void> {
		const oldDelta = this.#delta;
		if (oldDelta === newDelta) {
			return;
		}
		this.#delta = newDelta;
		await this.$recalibrate.emit();
	}
}
