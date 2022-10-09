import * as THREE from 'three';
import { Event } from './classes/Event.ts';
import { EventedValue } from './classes/EventedValue.ts';
import Game from './Game.ts';
import { SaveEntityJson, SaveTerrainJson, SaveTileJson } from './types-savedgame.ts';

export type GeometryI =
	| THREE.BoxGeometry
	| THREE.CircleGeometry
	| THREE.ConeGeometry
	| THREE.CylinderGeometry
	| THREE.DodecahedronGeometry
	| THREE.EdgesGeometry
	| THREE.ExtrudeGeometry
	| THREE.IcosahedronGeometry
	| THREE.LatheGeometry
	| THREE.OctahedronGeometry
	| THREE.PlaneGeometry
	| THREE.PolyhedronGeometry
	| THREE.RingGeometry
	| THREE.ShapeGeometry
	| THREE.SphereGeometry
	| THREE.TetrahedronGeometry
	| THREE.TorusGeometry
	| THREE.TorusKnotGeometry
	| THREE.TubeGeometry
	| THREE.WireframeGeometry;

export type GameDistance = number;

export type SvgMouseInteractionProps = {
	onClick?: (event: MouseEvent) => void;
	onContextMenu?: (event: MouseEvent) => void;
};

/**
 * A function that filters tiles.
 */
export type TileFilter<T extends TileI> = (tile: T) => boolean;

/**
 * A point in space
 */
export interface CoordinateI {
	x: GameDistance;
	y: GameDistance;
	z: GameDistance;
	angleTo(to: CoordinateI): number;
	equals(coord: CoordinateI): boolean;
	euclideanDistanceTo(x: GameDistance, y: GameDistance, z: GameDistance): GameDistance;
	euclideanDistanceTo(coord: CoordinateI): GameDistance;
	hasNaN(): boolean;
	manhattanDistanceTo(coord: CoordinateI): GameDistance;
	toString(): string;
	toArray(): [GameDistance, GameDistance, GameDistance];
	transform(dx: GameDistance, dy: GameDistance, dz: GameDistance): this;
	transform(delta: CoordinateI): this;
	scale(multiplier: number): this;
}
/**
 * A tile
 */

export interface TileI extends CoordinateI {
	terrain?: TerrainI;
	neighbors: TileI[];
	equals(other: TileI): boolean;
	getOutlineCoordinates(): CoordinateI[];
	isAdjacentToEdge(): boolean;
	isAdjacentToLand(): boolean;
	isLand(): boolean;
	serializeToSaveJson(): SaveTileJson;
}

/**
 * A geographic collection of tiles
 */
export interface TerrainI {
	/**
	 * Array of all tiles that make up this terrain.
	 */
	tiles: TileI[];

	/**
	 * Select all the tiles that are adjacent to the starting tile, so long as they match the
	 * selector.
	 */
	selectContiguousTiles(
		start: TileI,
		selector: TileFilter<TileI>,
		/**
		 * Wether or not the starting tile should be part of the group.
		 */
		inclusive: boolean,
	): TileI[];

	/**
	 * Get the tiles closest to the starting tile (not counting the starting tile itself).
	 */
	selectClosestTiles(start: CoordinateI, maxDistance: number): TileI[];

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 */
	getIslands(selector: TileFilter<TileI>): TileI[][];

	/**
	 * Get the tile closest to an XY coordinate.
	 */
	getTileClosestToXy(x: number, y: number): TileI;

	/**
	 * Get the tiles that are adjacent to another tile.
	 */
	getNeighborTiles(center: TileI): TileI[];

	getMedianCoordinate(): CoordinateI;

	serializeToSaveJson(): SaveTerrainJson;
}

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
	play(game: Game): void;

	/**
	 * Undoes any event handling that this entity does.
	 */
	destroy(): void;

	/**
	 * Set or change the job that this entity is currently on.
	 */
	doJob(job: JobI): void;

	/**
	 * Should return any Three.js geometry
	 */
	createObject(): THREE.Group;

	serializeToSaveJson(): SaveEntityJson;
}

export interface EntityPersonI extends EntityI {
	/**
	 * Event: The event that the person finishes a path, according to react-spring's timing
	 */
	$stoppedWalking: Event<[]>;

	/**
	 * Event: The person started one step
	 */
	$startedWalking: Event<
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
	 * Event: The person started finished one step, according to react-spring's timing
	 */
	$stoppedWalkStep: Event<[CoordinateI]>;

	/**
	 * Make the entity choose a path from its current location to the destination, and start an animation.
	 */
	walkToTile(destination: TileI): void;
}

/**
 * An activity that entities do.
 */
export interface JobI {
	label: string;
	start(game: Game): void;
	destroy(): void;
}

export type SeedI = string | number;

export interface ViewI {
	/**
	 * The event that an entity mesh is clicked
	 */
	$clickEntity: Event<[MouseEvent, EntityPersonI]>;

	/**
	 * The event that a tile mesh is clicked
	 */
	$clickTile: Event<[MouseEvent, TileI]>;

	/**
	 * The event that the ThreeJS canvas was clicked, but it was not on an entity or tile.
	 */
	$click: Event<[MouseEvent]>;
}

export interface ControllerI {
	$$animating: EventedValue<boolean>;
	attachToGame(game: Game): void;
	detachFromGame(): void;
	startAnimationLoop(): void;
	stopAnimationLoop(): void;
}
