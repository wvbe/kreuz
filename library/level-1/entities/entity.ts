import { Attachable } from '../classes/Attachable.ts';
import { Collection } from '../classes/Collection.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import { type TradeOrder } from '../classes/TradeOrder.ts';
import type Game from '../Game.ts';
import { Coordinate } from '../terrain/Coordinate.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type CoordinateI } from '../types.ts';
import { token } from '../utilities/ReplacementSpace.ts';
import { type EntityI } from './types.ts';

export class Entity extends Attachable<[Game]> implements EntityI {
	/**
	 * Unique identifier
	 */
	public readonly id: string;

	public $$location: EventedValue<CoordinateI>;

	/**
	 * Used for generating a save
	 */
	public type = 'entity';

	public readonly $status = new EventedValue<string | null>(
		null,
		`${this.constructor.name} $status`,
	);

	public readonly $log = new Collection<TradeOrder>();

	constructor(id: string, location: { x: number; y: number; z: number }) {
		super();

		this.id = id;

		this.$$location = new EventedValue(
			Coordinate.clone(location),
			`${this.constructor.name} $$location`,
		);
	}

	public get name(): string {
		return `${this.constructor.name} ${this.id}`;
	}

	public get icon(): string {
		return '📦';
	}

	public get label(): string {
		return `${this.icon} ${this.name}`;
	}

	public distanceTo(otehr: CoordinateI | EntityI) {
		if ((otehr as EntityI).$$location) {
			return this.$$location.get().euclideanDistanceTo((otehr as EntityI).$$location.get());
		} else {
			return this.$$location.get().euclideanDistanceTo(otehr as CoordinateI);
		}
	}

	toString(): string {
		return token('entity', this);
	}

	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveEntityJson {
		return {
			type: this.type,
			id: this.id,
			location: this.$$location.get().toArray(),
		};
	}
}
