import type Game from '../../Game';
import { Event } from '../../events/Event';
import { EventedValue } from '../../events/EventedValue';
import { QualifiedCoordinate } from '../../terrain/types';
import { CallbackFn } from '../../types';
import { Tile, tileArchetype } from '../archetypes/tileArchetype';
import { hasEcsComponents } from '../assert';
import { EcsComponent } from '../classes/EcsComponent';
import { EcsEntity } from '../types';
import { healthComponent } from './healthComponent';
import { locationComponent } from './locationComponent';
import { Path } from './pathingComponent/Path';
import { visibilityComponent } from './visibilityComponent';

type PathingEntity = EcsEntity<typeof locationComponent | typeof pathingComponent>;

async function animateTo(entity: PathingEntity, destination: QualifiedCoordinate) {
	const distance = entity.euclideanDistanceTo(destination);
	await entity.$stepStart.set({
		destination,
		duration: distance / entity.walkSpeed,
		done: async () => await entity.$stepEnd.emit(destination),
	});
}

async function walkToTile(
	entity: PathingEntity,
	game: Game,
	destination: Tile,
	stopAtDistanceToTarget: number = 0,
) {
	if (!locationComponent.test(entity) || !pathingComponent.test(entity)) {
		throw new Error(`Entity ${entity} is unable to walk`);
	}

	// Its _possible_ that an entity lives on a tile that has so much elevation that
	// .getTileClosestToXy actually finds the _wrong_ tile -- because its neighbor is closer than
	// the proximity to z=0. In that case, there is a bug:
	//
	// const start = terrain.getTileClosestToXy(this.location.get().x, this.location.get().y);
	//
	// To work around the bug, and as a cheaper option, find the tile whose XY is equal to the current
	// location. The only downsize is that entities that are mid-way a tile will not find one. Since
	// this is not a feature yet, we can use it regardless:
	const start = game.terrain.getTileAtMapLocation(entity.location.get());
	if (!start) {
		throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
	}
	const path = Path.forTile(start, {
		closest: true,
		obstacles: game.entities
			.filter(
				(entity) =>
					!tileArchetype.test(entity) &&
					hasEcsComponents(entity, [locationComponent, visibilityComponent]),
			)
			.map((entity) => ({
				coordinate: (entity as EcsEntity<typeof locationComponent>).location.get(),
				cost: 12,
			})),
	}).to(destination);

	const lastTileInPath = path[path.length - 1];
	if (lastTileInPath) {
		const distanceToTarget = destination.euclideanDistanceTo(lastTileInPath.location.get());
		if (distanceToTarget > stopAtDistanceToTarget) {
			throw new Error('Could not find a path close enough to the target');
		}
	}
	// -----------------------------

	// @TODO add some safety checks on the path maybe.
	// Emitting this event may prompt the promises of other walkOnTile tasks to reject.
	const nextTileInPath = path.shift();
	if (!nextTileInPath) {
		return;
	}

	await entity.$path.set(path);

	let nextStepIndex = 0;
	const unlisten = entity.$stepEnd.on(async (coordinate) => {
		entity.location.set(coordinate);
		const nextStep = path[nextStepIndex++];
		if (!nextStep) {
			unlisten();
			unlistenNewPath();
			await entity.$path.set(null);
		} else {
			await animateTo(entity, nextStep.location.get());
		}
	});

	// If another .walkAlongPath call interrupts us, stop listening for our own $stepEnd events.
	// @TODO this is untested
	const unlistenNewPath = entity.$path.once((path) => {
		if (path) {
			unlistenNewPath();
			unlisten();
		}
	});

	const promise = new Promise<void>((resolve, reject) => {
		const stopListeningForDeath =
			// Walking around may be stopped by death, ie. there is a dependency on healthComponent,
			// but having health is not a prerequisite.
			(entity as unknown as EcsEntity<typeof healthComponent>).$death?.on(() => {
				cancelWalk();
			});

		const stopListeningForFinish = entity.$path.on((path) => {
			if (path === null) {
				stopListeningForFinish();
				stopListeningForDeath();
				resolve();
			}
		});
		const cancelWalk = () => {
			stopListeningForFinish();
			stopListeningForDeath();
			reject();
		};
	});

	// Take the first step to kick off this event chain;
	await animateTo(entity, nextTileInPath.location.get());

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
		walkToTile(game: Game, tile: Tile, stopAtDistanceToTarget?: number): Promise<void>;
		/**
		 * The distance covered per game time.
		 */
		walkSpeed: number;
		/**
		 * The path that this entity is currently walking along, so long as it is walking.
		 */
		$path: EventedValue<Tile[] | null>;
		/**
		 * Emitted when the entity starts a new step in the path.
		 */
		$stepStart: EventedValue<{
			/**
			 * The destination of this step
			 */
			destination: QualifiedCoordinate;
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
		$stepEnd: Event<[QualifiedCoordinate]>;
	}
>(
	(entity) =>
		entity.$path instanceof Event &&
		entity.$stepStart instanceof EventedValue &&
		entity.$stepEnd instanceof Event &&
		typeof entity.walkToTile === 'function',
	(entity, options) => {
		const events = {
			walkToTile: walkToTile.bind(null, entity as PathingEntity),
			walkSpeed: options.walkSpeed,
			$path: new EventedValue(null, 'pathingComponent $path'),
			$stepStart: new EventedValue<{
				destination: QualifiedCoordinate;
				duration: number;
				done: CallbackFn;
			} | null>(null, 'pathingComponent $stepStart'),
			$stepEnd: new Event<[QualifiedCoordinate]>('pathingComponent $stepEnd'),
		};
		Object.assign(entity, events);
	},
);
