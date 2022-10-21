import { type EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';
import { type JobI } from '../jobs/types.ts';
import { SaveableObject } from '../types-savedgame.ts';
import { SavedCoordinateI, type CoordinateI } from '../types.ts';

export type SavedEntityI = {
	type: string;
	id: string;
	location: SavedCoordinateI;
};
export interface EntityI extends SaveableObject<SavedEntityI> {
	type: string;

	/**
	 * A unique identifier for this entity
	 */
	id: string;

	/**
	 * An emoji that makes the entity more recognizable at a glance.
	 */
	icon: string;

	/**
	 * The human-readable name for this entity.
	 */
	name: string;

	/**
	 * A recognizable string that represents this entity, even if a lot of context is missing. By
	 * default it is a combination of the icon and name.
	 */
	label: string;

	/**
	 * A short description of what this entity is or does. For example, they are the bailiff or they're
	 * guarding a place.
	 */
	title: string;

	/**
	 * The location of this entity, if it is standing on any particular tile.
	 */
	$$location: EventedValue<CoordinateI>;

	/**
	 * The job that this entity is currently on.
	 */
	$$job?: EventedValue<JobI | null>;

	/**
	 * Sets the entity in motion on any job or other type of event handling.
	 */
	attach(game: Game): void;

	/**
	 * Undoes any event handling that this entity does.
	 */
	detach(): void;

	/**
	 * Set or change the job that this entity is currently on.
	 */
	doJob(job: JobI): void;

	// serializeToSaveJson(): SaveEntityJson;
}
