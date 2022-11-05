export class Material {
	/**
	 * The human-readable label given to this material.
	 */
	public readonly label: string;

	/**
	 * A one or two-symbol string that represents the material.
	 */
	public readonly symbol: string;

	/**
	 * The amount of materials that fits in one stack. A voluminous material has a smaller stack size.
	 */
	public readonly stack: number;

	/**
	 * The amount of money one item of this is worth.
	 */
	public readonly value: number;

	/**
	 * The amount of "food" need that is fulfilled by consuming one of these.
	 */
	public readonly nutrition: number;
	/**
	 * The amount of "water" need that is fulfilled by consuming one of these.
	 */
	public readonly fluid: number;

	/**
	 * The amount of "health" need that is _penalized_ by consuming one of these.
	 *
	 * @TODO implement "health"
	 */
	public readonly toxicity: number;

	public constructor(
		label: string,
		{
			symbol,
			stackSize,
			value,
			nutrition,
			fluid,
			toxicity,
		}: {
			symbol: string;
			stackSize: number;
			value?: number;
			nutrition?: number;
			fluid?: number;
			toxicity?: number;
		},
	) {
		this.label = label;
		this.stack = stackSize;
		this.symbol = symbol;
		this.value = value || 0;
		this.nutrition = nutrition || 0;
		this.fluid = fluid || 0;
		this.toxicity = toxicity || 0;
	}

	toString() {
		return `${this.symbol} ${this.label}`;
	}
}
