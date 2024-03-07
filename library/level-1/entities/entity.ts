import { Attachable } from '../classes/Attachable.ts';
import { Collection } from '../events/Collection.ts';
import { EventedValue, type SaveEventedValueJson } from '../events/EventedValue.ts';
import { type TradeOrder } from '../classes/TradeOrder.ts';
import type Game from '../Game.ts';
import { Coordinate } from '../terrain/Coordinate.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
import { type CoordinateI, type SimpleCoordinate } from '../types.ts';
import { token } from '../utilities/ReplacementSpace.ts';
import { type EntityI } from './types.ts';

export type SaveEntityJson = {
	type: string;
	id: string;
	location: SimpleCoordinate;
	status: SaveEventedValueJson;
};

export class Entity extends Attachable<[Game]> implements EntityI {
	/**
	 * Unique identifier
	 */
	public readonly id: string;

	public $$location: EventedValue<CoordinateI>;

	public type = 'entity';

	public readonly $status = new EventedValue<string | null>(
		null,
		`${this.constructor.name} $status`,
	);

	public readonly $log = new Collection<TradeOrder>();

	constructor(id: string, location: SimpleCoordinate) {
		super();

		this.id = id;

		this.$$location = new EventedValue(
			new Coordinate(...location),
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

	public distanceTo(other: CoordinateI | EntityI) {
		if ((other as EntityI).$$location) {
			return this.$$location.get().euclideanDistanceTo((other as EntityI).$$location.get());
		} else {
			return this.$$location.get().euclideanDistanceTo(other as CoordinateI);
		}
	}

	toString(): string {
		return token('entity', this);
	}

	/**
	 * Serialize for a save game JSON
	 */
	public toSaveJson(context: SaveJsonContext): SaveEntityJson {
		return {
			type: this.type,
			id: this.id,
			location: this.$$location.get().toArray(),
			status: this.$status.toSaveJson(context),
		};
	}
}
