import { Attachable } from '../classes/Attachable.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';
import { Coordinate } from '../terrain/Coordinate.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type CoordinateI } from '../types.ts';
import { type EntityI } from './types.ts';

export class Entity extends Attachable<[Game]> implements EntityI {
	/**
	 * Unique identifier
	 *
	 * Probably more useful as a seed than anything else.
	 */
	public readonly id: string;

	public $$location: EventedValue<CoordinateI>;

	/**
	 * Used for generating a save
	 */
	public type = 'entity';

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

	public get title(): string {
		// @TODO
		return 'Idle';
	}

	toString() {
		return this.label;
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
