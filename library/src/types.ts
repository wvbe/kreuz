import { type Terrain } from './terrain/Terrain.ts';

export type GameDistance = number;

/**
 * A function that filters tiles.
 */
export type TileFilterFn<T extends TileI> = (tile: T) => boolean;

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
	serializeToSaveJson(): SavedCoordinateI;
}

export type SavedCoordinateI = {
	x: GameDistance;
	y: GameDistance;
	z: GameDistance;
};

/**
 * A tile
 */
export interface TileI extends CoordinateI {
	terrain?: Terrain;
	/**
	 * @deprecated Use Terrain.getNeighborTiles instead if you can
	 */
	neighbors: TileI[];
	equals(other: TileI): boolean;
	getOutlineCoordinates(): CoordinateI[];
	isAdjacentToEdge(): boolean;
	isAdjacentToLand(): boolean;
	isLand(): boolean;
	serializeToSaveJson(): SavedTileI;
}

export interface SavedTileI extends SavedCoordinateI {
	neighbors: SavedCoordinateI[];
	outline: SavedCoordinateI[];
}

export type SeedI = string | number;

/**
 * A simple function that destroys whatever timeout/listener/async operation was set using
 * the method that returned it.
 *
 * @remarks
 * This type is a generic description of the _role_ of a function more so than the shape. Not every
 * function with the same shape fulfills the same role!
 *
 * Sometimes a destroyer function returns some useful info -- such as the time left on a cancelled
 * timeout.
 */
export type DestroyerFn<P = void> = () => P;

/**
 * A simple function that is called whenever this timeout/listener/async operation triggers or
 * finishes.
 *
 * Callbacks sometimes receive arguments, but never have a return value.
 *
 * @remarks
 * This type is a generic description of the _role_ of a function more so than the shape. Not every
 * function with the same shape fulfills the same role!
 */
export type CallbackFn<Args extends unknown[] = never[]> = (...args: Args) => void;

export type SortFn<T> = (a: T, b: T) => number;

export type FilterFn<T> = (a: T) => boolean;
