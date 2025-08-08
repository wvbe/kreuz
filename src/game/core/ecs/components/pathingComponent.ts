import type Game from '../../Game';
import { Event } from '../../events/Event';
import { EventedValue } from '../../events/EventedValue';
import { QualifiedCoordinate, TerrainPortal } from '../../terrain/types';
import { CallbackFn } from '../../types';
import { Tile } from '../archetypes/tileArchetype';
import { EcsComponent } from '../classes/EcsComponent';
import { walkToTile, PathingEntity } from './pathingComponent/walkToTileAnimation';

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
		 * Resolves when the walking is done.
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

		$portalEntered: Event<[TerrainPortal]>;
		$portalExited: Event<[TerrainPortal]>;
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
			$portalEntered: new Event<[TerrainPortal]>('pathingComponent $portalEntered'),
			$portalExited: new Event<[TerrainPortal]>('pathingComponent $portalExited'),
		};
		Object.assign(entity, events);
	},
);
