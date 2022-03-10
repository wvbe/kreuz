import React, { ComponentType } from 'react';
import { Coordinate } from './classes/Coordinate';
import { Event } from './classes/Event';

export type SvgMouseInteractionProps = Pick<
	React.SVGProps<SVGGElement>,
	'onClick' | 'onContextMenu' | 'onMouseEnter' | 'onMouseLeave'
>;

/**
 * A function that filters tiles.
 */
export type TileFilter<T extends TileI> = (tile: T) => boolean;

/**
 * A tile
 */
export interface TileI extends Coordinate {
	terrain?: TerrainI;
	equals(other: TileI): boolean;

	isLand(): boolean;
	isAdjacentToLand(): boolean;
	isAdjacentToEdge(): boolean;
	getOutlineCoordinates(): Coordinate[];
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
	 * The React component for rendering this.
	 *
	 * @deprecated This interface should not be tightly coupled with rendering
	 */
	Component: ComponentType<{
		terrain: TerrainI;
		onTileClick?: (event: React.MouseEvent<SVGGElement>, tile: TileI) => void;
		onTileContextMenu?: (event: React.MouseEvent<SVGGElement>, tile: TileI) => void;
	}>;

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
		inclusive: boolean
	): TileI[];

	/**
	 * Get the tiles closest to the starting tile (not counting the starting tile itself).
	 */
	selectClosestTiles(start: TileI, maxDistance: number): TileI[];

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 */
	getIslands(selector: TileFilter<TileI>): TileI[][];

	/**
	 * Sort tiles in order so that the DOM render order is such that the tiles closest to the camera
	 * overlap the tiles further away.
	 */
	getTilesInRenderOrder(): TileI[];

	/**
	 * Get the tile closest to an XY coordinate.
	 */
	getTileClosestToXy(x: number, y: number): TileI;

	/**
	 * Get the tiles that are adjacent to another tile.
	 */
	getNeighborTiles(center: TileI): TileI[];
}

export interface EntityI {
	/**
	 * A unique identifier for this entity
	 */
	id: string;

	/**
	 * The human-readable name for this entity.
	 */
	label: string;

	/**
	 * The location of this entity, if it is standing on any particular tile.
	 */
	location?: TileI;

	/**
	 * The job that this entity is currently on.
	 */
	job?: JobI;

	/**
	 * Sets the entity in motion on any job or other type of event handling.
	 */
	play(): void;

	/**
	 * Undoes any event handling that this entity does.
	 */
	destroy(): void;

	/**
	 * Set or change the job that this entity is currently on.
	 */
	doJob(job: JobI): void;

	/**
	 * The React component for rendering this.
	 *
	 * @deprecated This interface should not be tightly coupled with rendering
	 */
	Component: ComponentType<{
		[key: string]: never;
	}>;
}

export interface EntityPersonI extends EntityI {
	/**
	 * Event: The event that the person finishes a path, according to react-spring's timing
	 */
	$stoppedWalking: Event<[]>;

	/**
	 * Event: The person started one step
	 */
	$startedWalkStep: Event<[TileI]>;

	/**
	 * Event: The person started finished one step, according to react-spring's timing
	 */
	$stoppedWalkStep: Event<[TileI]>;

	/**
	 * Make the entity choose a path from its current location to the destination, and start an animation.
	 */
	walkTo(destination: TileI): void;
}

/**
 * An activity that entities do.
 */
export interface JobI {
	label: string;
	start(): void;
	destroy(): void;
}
