import { type CallbackFn, type DestroyerFn } from '../types.ts';
import { Event } from './Event.ts';
import { EventedValue, type SaveEventedValueJson } from './EventedValue.ts';

export type SaveEventedNumericValueJson = SaveEventedValueJson<number> & {
	boundaries: Array<{
		min: number;
		max: number;
		minInclusive: boolean;
		maxInclusive: boolean;
	}>;
};

type BetweenRange = {
	min: number;
	max: number;
	minInclusive: boolean;
	maxInclusive: boolean;
	event: Event;
};

function valueInRange(value: number, range: BetweenRange) {
	return (
		(range.minInclusive ? value >= range.min : value > range.min) &&
		(range.maxInclusive ? value <= range.max : value < range.max)
	);
}

export class EventedNumericValue extends EventedValue<number> {
	readonly #boundaryInfo: BetweenRange[] = [];

	protected get getWatchedRanges() {
		return this.#boundaryInfo;
	}

	/**
	 * DRY some of the code for onBetween and onceBetween
	 */
	#createRangeEvent(
		min: number,
		max: number,
		inclusiveness: { min: boolean; max: boolean },
	): BetweenRange {
		const info = {
			min,
			max,
			minInclusive: inclusiveness.min,
			maxInclusive: inclusiveness.max,
			event: new Event(`${this.label} between ${min}-${max}`),
		};
		this.#boundaryInfo.push(info);

		return info;
	}

	/**
	 * Trigger callback whenever the value enters the specified range.
	 *
	 * Will not trigger when the value changes _within_ the range, or out of the range.
	 */
	public onBetween(
		min: number,
		max: number,
		callback: CallbackFn,
		inclusiveness = { min: true, max: false },
	): DestroyerFn {
		const info = this.#createRangeEvent(min, max, inclusiveness);
		const forget = () => {
			const index = this.#boundaryInfo.indexOf(info);
			if (index >= 0) {
				this.#boundaryInfo.splice(index, 1);
			}
		};
		const destroy = info.event.on(callback);
		return () => {
			destroy();
			forget();
		};
	}

	/**
	 * Trigger callback the first time the value enters the specified range.
	 *
	 * Will not trigger when the value changes _within_ the range, or out of the range.
	 */
	public onceBetween(
		min: number,
		max: number,
		callback: CallbackFn,
		inclusiveness = { min: true, max: false },
	): DestroyerFn {
		const info = this.#createRangeEvent(min, max, inclusiveness);
		const forget = () => {
			const index = this.#boundaryInfo.indexOf(info);
			if (index >= 0) {
				this.#boundaryInfo.splice(index, 1);
			}
		};
		const destroy = info.event.once(() => {
			callback();
			forget();
		});
		return () => {
			destroy();
			forget();
		};
	}

	public onAbove(min: number, callback: CallbackFn, inclusive = true): DestroyerFn {
		return this.onBetween(min, Infinity, callback, { min: inclusive, max: true });
	}
	public onBelow(max: number, callback: CallbackFn, inclusive = false): DestroyerFn {
		return this.onBetween(-Infinity, max, callback, { min: true, max: inclusive });
	}
	public onceAbove(min: number, callback: CallbackFn, inclusive = true): DestroyerFn {
		return this.onceBetween(min, Infinity, callback, { min: inclusive, max: true });
	}
	public onceBelow(max: number, callback: CallbackFn, inclusive = false): DestroyerFn {
		return this.onceBetween(-Infinity, max, callback, { min: true, max: inclusive });
	}

	public getCurrentRanges() {
		return this.#boundaryInfo.filter((range) => valueInRange(this.current, range));
	}

	public set(value: number, skipUpdate?: boolean) {
		const last = this.current;
		super.set(value, skipUpdate);
		if (skipUpdate) {
			return;
		}
		const ranges = this.getCurrentRanges().filter((range) => !valueInRange(last, range));

		for (let i = 0; i < ranges.length; i++) {
			ranges[i].event.emit();
		}
	}
	public toSaveJson(): SaveEventedNumericValueJson {
		return {
			...super.toSaveJson(),
			boundaries: this.#boundaryInfo.map((boundary) => ({
				min: boundary.min,
				max: boundary.max,
				minInclusive: boundary.minInclusive,
				maxInclusive: boundary.maxInclusive,
			})),
		};
	}
}
