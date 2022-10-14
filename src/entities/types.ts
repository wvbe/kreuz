import type Game from '../Game.ts';
import { type Event } from '../classes/Event.ts';
import { type EventedValue } from '../classes/EventedValue.ts';
import { type JobI } from '../jobs/types.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type TileI, type CoordinateI, CallbackFn } from '../types.ts';
import { type Need } from './Need.ts';

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
	 * Event: The event that the person finishes every step of a path.
	 */
	$pathEnd: Event<[]>;

	/**
	 * Event: The person started one step.
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

			/**
			 * The "done" callback. Call this when the driver animation/timeout ends, so that
			 * the next event is safely emitted.
			 */
			CallbackFn,
		]
	>;

	/**
	 * Event: The person started finished one step. The entities location is updated upon this event.
	 *
	 * Do not emit this event. Instead, call the "done()" argument of the $stepStart event. For
	 * example:
	 *
	 *   entity.$stepStart.on((destination, duration, done) => {
	 *      console.log(`Entity starts stepping towards ${destination}`);
	 *      game.time.setTimeout(done, duration);
	 *   });
	 */
	$stepEnd: Event<[CoordinateI]>;

	/**
	 * Make the entity choose a path from its current location to the destination, and start an animation.
	 */
	walkToTile(destination: TileI): void;
}

export type PersonNeedsI = {
	food: Need;
	water: Need;
	sleep: Need;
	hygiene: Need;
	spirituality: Need;
};
