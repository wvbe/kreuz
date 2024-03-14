import { TileI } from '@lib';
import { Event } from '../../events/Event.ts';
import { EventedValue } from '../../events/EventedValue.ts';
import { CallbackFn, CoordinateI } from '../../types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';
import { EcsEntity } from '../types.ts';
import { locationComponent } from './locationComponent.ts';
import { Path } from '../../classes/Path.ts';
import { Coordinate } from '@lib';

type WalkableEntity = EcsEntity<typeof locationComponent | typeof pathingComponent>;

async function animateTo(entity: WalkableEntity, coordinate: Coordinate) {
	if (coordinate.hasNaN()) {
		// @TODO remove at some point?
		throw new Error('This should never happen I suppose');
	}
	const done = async () => await entity.$stepEnd.emit(coordinate);
	const distance = entity.$$location.get().euclideanDistanceTo(coordinate as CoordinateI);
	await entity.$stepStart.emit(coordinate, distance / entity.walkSpeed, done);
}

export async function walkToTile(entity: WalkableEntity, destination: TileI) {
	if (!locationComponent.test(entity) || !pathingComponent.test(entity)) {
		throw new Error(`Entity ${entity} is unable to walk`);
	}

	const terrain = destination.terrain;
	if (!terrain) {
		throw new Error(`Entity "${entity.id}" is trying to path to a detached coordinate`);
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
	const start = terrain.getTileEqualToLocation(entity.$$location.get());
	const path = new Path(terrain, { closest: true }).findPathBetween(start, destination);

	// -----------------------------

	// @TODO add some safety checks on the path maybe.
	// Emitting this event may prompt the promises of other walkOnTile tasks to reject.
	const nextTileInPath = path.shift();
	if (!nextTileInPath) {
		return;
	}

	await entity.$pathStart.emit();

	const unlisten = entity.$stepEnd.on(async (coordinate) => {
		entity.$$location.set(coordinate);
		const nextStep = path.shift();
		if (!nextStep) {
			unlisten();
			unlistenNewPath();
			await entity.$pathEnd.emit();
		} else {
			await animateTo(entity, nextStep);
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
			resolve();
		});
		const stopListeningForInterrupt = entity.$pathStart.once(() => {
			stopListeningForFinish();
			reject();
		});
	});

	// Take the first step to kick off this event chain;
	await animateTo(entity, nextTileInPath);

	return promise;
}

export const pathingComponent = new EcsComponent<
	{
		walkSpeed: number;
	},
	{
		walkToTile(tile: TileI): Promise<void>;
		walkSpeed: number;
		$pathStart: Event<[]>;
		/**
		 * The "done" callback. Call this when the driver animation/timeout ends, so that
		 * the next event is safely emitted.
		 */
		$pathEnd: Event<[]>;
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
		$stepEnd: Event<[CoordinateI]>;
	}
>(
	(entity) =>
		locationComponent.test(entity) &&
		entity.$pathStart instanceof Event &&
		entity.$pathEnd instanceof Event &&
		entity.$stepStart instanceof Event &&
		entity.$stepEnd instanceof Event &&
		typeof entity.walkToTile === 'function',
	(entity, options) => {
		Object.assign(entity, {
			walkToTile: walkToTile.bind(null, entity as WalkableEntity),
			walkSpeed: options.walkSpeed,
			$pathStart: new Event<[]>('pathingComponent $pathStart'),
			$pathEnd: new Event<[]>('pathingComponent $pathEnd'),
			$stepStart: new Event<[CoordinateI, number, CallbackFn]>('pathingComponent $stepStart'),
			$stepEnd: new Event<[CoordinateI]>('pathingComponent $stepEnd'),
		});
	},
);
