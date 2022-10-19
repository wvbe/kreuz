import { type EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';
import { type JobI } from '../jobs/types.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type CoordinateI } from '../types.ts';

export interface EntityI {
	type: string;

	/**
	 * A unique identifier for this entity
	 */
	id: string;

	/**
	 * The human-readable name for this entity.
	 */
	label: string;

	/**
	 * An emoji that makes the entity more recognizable at a glance.
	 */
	icon: string;

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

	serializeToSaveJson(): SaveEntityJson;
}
