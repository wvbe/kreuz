import { type Game } from '../../mod.ts';
import { type Event } from '../classes/Event.ts';
import { type EventedValue } from '../classes/EventedValue.ts';
import { type JobI } from '../jobs/types.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type TileI, type CoordinateI } from '../types.ts';

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
	job?: JobI;

	/**
	 * Sets the entity in motion on any job or other type of event handling.
	 */
	attach(game: Game): void;

	/**
	 * Undoes any event handling that this entity does.
	 */
	destroy(): void;

	/**
	 * Set or change the job that this entity is currently on.
	 */
	doJob(job: JobI): void;

	serializeToSaveJson(): SaveEntityJson;
}

export interface EntityPersonI extends EntityI {
	/**
	 * Event: The event that the person finishes a path, according to react-spring's timing
	 */
	$pathEnd: Event<[]>;

	/**
	 * Event: The person started one step
	 */
	$stepStart: Event<
		[
			/**
			 * The destination of this step
			 */
			CoordinateI,
			/**
			 * The expected duration of time it takes to perform this step
			 */
			number,
		]
	>;

	/**
	 * Event: The person started finished one step, according to react-spring's timing. Emitting this
	 * will automatically update the entity location.
	 */
	$stepEnd: Event<[CoordinateI]>;

	/**
	 * Make the entity choose a path from its current location to the destination, and start an animation.
	 */
	walkToTile(destination: TileI): void;
}
