import type Game from '../../Game.ts';
import { Path } from './pathingComponent/Path.ts';
import { Event } from '../../events/Event.ts';
import { EventedValue } from '../../events/EventedValue.ts';
import { healthComponent } from '@lib/core';
import { Coordinate } from '../../terrain/Coordinate.ts';
import { CallbackFn } from '../../types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { EcsEntity } from '../types.ts';
import { locationComponent } from './locationComponent.ts';
import { pathableComponent } from './pathableComponent.ts';
import { type CoordinateI } from '../../terrain/types.ts';

type WalkableEntity = EcsEntity<typeof locationComponent | typeof pathingComponent>;
type WalkableTile = EcsEntity<typeof locationComponent | typeof pathableComponent>;

async function animateTo(entity: WalkableEntity, destination: CoordinateI) {
	const distance = entity.$$location.get().euclideanDistanceTo(destination as CoordinateI);
	await entity.$stepStart.set({
		destination,
		duration: distance / entity.walkSpeed,
		done: async () => await entity.$stepEnd.emit(destination),
	});
}

async function walkToTile(entity: WalkableEntity, game: Game, destination: WalkableTile) {
	if (!locationComponent.test(entity) || !pathingComponent.test(entity)) {
		throw new Error(`Entity ${entity} is unable to walk`);
	}

	// Its _possible_ that an entity lives on a tile that has so much elevation that
	// .getTileClosestToXy actually finds the _wrong_ tile -- because its neighbor is closer than
	// the proximity to z=0. In that case, there is a bug:
	//
	// const start = terrain.getTileClosestToXy(this.$$location.get().x, this.$$location.get().y);
	//
	// To work around the bug, and as a cheaper option, find the tile whose XY is equal to the current
	// location. The only downsize is that entities that are mid-way a tile will not find one. Since
	// this is not a feature yet, we can use it regardless:
	const start = game.terrain.getTileEqualToLocation(entity.$$location.get());
	if (!start) {
		throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
	}
	const path = new Path({ closest: true }).findPathBetween(start, destination);

	// -----------------------------

	// @TODO add some safety checks on the path maybe.
	// Emitting this event may prompt the promises of other walkOnTile tasks to reject.
	const nextTileInPath = path.shift();
	if (!nextTileInPath) {
		return;
	}

	await entity.$pathStart.emit(path);

	const unlisten = entity.$stepEnd.on(async (coordinate) => {
		entity.$$location.set(coordinate);
		const nextStep = path.shift();
		if (!nextStep) {
			unlisten();
			unlistenNewPath();
			await entity.$pathEnd.emit();
		} else {
			await animateTo(entity, nextStep.$$location.get());
		}
	});

	// If another .walkAlongPath call interrupts us, stop listening for our own $stepEnd events.
	// @TODO this is untested
	const unlistenNewPath = entity.$pathStart.once(() => {
		unlisten();
	});

	const promise = new Promise<void>((resolve, reject) => {
		const stopListeningForFinish = entity.$pathEnd.once(() => {
			stopListeningForInterrupt();
			stopListeningForDeath();
			resolve();
		});
		const cancelWalk = () => {
			stopListeningForFinish();
			stopListeningForDeath();
			reject();
		};
		const stopListeningForDeath =
			// Walking around may be stopped by death, ie. there is a dependency on healthComponent,
			// but having health is not a prerequisite.
			(entity as unknown as EcsEntity<typeof healthComponent>).$death?.on(() => {
				cancelWalk();
				stopListeningForInterrupt();
			});
		const stopListeningForInterrupt = entity.$pathStart.once(cancelWalk);
	});

	// Take the first step to kick off this event chain;
	await animateTo(entity, nextTileInPath.$$location.get());

	return promise;
}

/**
 * Entities with this component can walk along a path.
 */
export const pathingComponent = new EcsComponent<
	{
		walkSpeed: number;
	},
	{
		/**
		 * A method to make this entity find a path towards the given tile and animate towards it.
		 */
		walkToTile(game: Game, tile: WalkableTile): Promise<void>;
		/**
		 * The distance covered per game time.
		 */
		walkSpeed: number;
		/**
		 * Emitted when the entity starts walking along a path.
		 */
		$pathStart: Event<[WalkableTile[]]>;
		/**
		 * Emitted when the entity stops walking along a path.
		 */
		$pathEnd: Event<[]>;
		/**
		 * Emitted when the entity starts a new step in the path.
		 */
		$stepStart: EventedValue<{
			/**
			 * The destination of this step
			 */
			destination: CoordinateI;
			/**
			 * The expected duration of time it takes to perform this step
			 */
			duration: number;

			/**
			 * The "done" callback. Call this when the driver animation/timeout ends, so that
			 * the next event is safely emitted.
			 */
			done: CallbackFn;
		} | null>;
		/**
		 * Emitted when the entity finishes a step in the path.
		 */
		$stepEnd: Event<[CoordinateI]>;
	}
>(
	(entity) =>
		entity.$pathStart instanceof Event &&
		entity.$pathEnd instanceof Event &&
		entity.$stepStart instanceof EventedValue &&
		entity.$stepEnd instanceof Event &&
		typeof entity.walkToTile === 'function',
	(entity, options) => {
		Object.assign(entity, {
			walkToTile: walkToTile.bind(null, entity as WalkableEntity),
			walkSpeed: options.walkSpeed,
			$pathStart: new Event<[]>('pathingComponent $pathStart'),
			$pathEnd: new Event<[]>('pathingComponent $pathEnd'),
			$stepStart: new EventedValue<{
				destination: CoordinateI;
				duration: number;
				done: CallbackFn;
			} | null>(null, 'pathingComponent $stepStart'),
			$stepEnd: new Event<[CoordinateI]>('pathingComponent $stepEnd'),
		});
	},
);
