import { distanceToCameraComparator } from '../space/PERSPECTIVE';
import { Coordinate, CoordinateLike } from '../classes/Coordinate';
import { FunctionComponent } from 'react';

type TileFilter<T extends GenericTile> = (tile: T) => boolean;

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class GenericTile extends Coordinate {
	public terrain?: GenericTerrain<GenericTile>;

	equals(coord: CoordinateLike) {
		return this === coord || (coord && this.x === coord.x && this.y === coord.y);
	}

	static clone(coord: GenericTile) {
		const coord2 = new GenericTile(coord.x, coord.y, coord.z);
		coord2.terrain = (coord as GenericTile).terrain;
		return coord2;
	}

	isLand() {
		return this.z >= 0;
	}

	// For debugging purposes only, may change without notice or tests
	toString() {
		return '(' + [this.x, this.y].map((num: number) => num.toFixed(2)).join(',') + ')';
	}
}

class IslandMap<T> {
	filter: any;
	contents: T[];
	constructor(filter: any, contents: T[]) {
		this.filter = filter;
		this.contents = contents;
	}
}

export abstract class GenericTerrain<T extends GenericTile> {
	/**
	 * Private
	 */

	//
	private _tilesInRenderOrder: T[] | null = null;

	/**
	 * Public, shared code
	 */

	public readonly tiles: T[] = [];

	//
	protected islands: Map<TileFilter<T>, T[][]> = new Map();

	constructor(tiles: T[]) {
		this.tiles = tiles;
	}

	//
	public selectContiguousTiles(start: T, selector: TileFilter<T> = c => c.isLand()): T[] {
		const island: T[] = [];
		const seen: T[] = [];
		const queue: T[] = [start];

		while (queue.length) {
			const current = queue.shift() as T;
			island.push(current);

			const neighbours = this.getNeighborTiles(current).filter(n => !seen.includes(n));
			seen.splice(0, 0, current, ...neighbours);
			queue.splice(0, 0, ...neighbours.filter(selector));
		}
		return island;
	}

	//
	public selectClosestTiles(start: T, maxDistance: number): T[] {
		return this.selectContiguousTiles(
			start,
			other => other.isLand() && start.euclideanDistanceTo(other) <= maxDistance
		);
	}

	//
	public getIslands(selector: TileFilter<T> = t => t.isLand()): T[][] {
		const fromCache = this.islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.tiles.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as T;
			if (!selector(next)) {
				continue;
			}
			const island = this.selectContiguousTiles(next, selector);
			open = open.filter(n => !island.includes(n));
			islands.push(island);
		}

		this.islands.set(selector, islands);
		return islands;
	}

	//
	public getTilesInRenderOrder() {
		if (!this._tilesInRenderOrder) {
			this._tilesInRenderOrder = this.tiles.slice().sort(distanceToCameraComparator);
		}
		return this._tilesInRenderOrder;
	}

	/**
	 * Abstract methods
	 */

	//
	public abstract Component: FunctionComponent<GenericTerrainComponentProps<T>> = () => {
		throw new Error('Not implemented');
	};

	//
	public abstract getClosestToXy(x: number, y: number): T;

	//
	public abstract getNeighborTiles(center: T): T[];

	/**
	 * Statics
	 */

	//
	static generateRandom(seed: string, size: number): GenericTerrain<GenericTile> {
		throw new Error('Not implemented');
	}
}

export type GenericTerrainComponentProps<Tile extends GenericTile = GenericTile> = {
	onTileClick?: (event: React.MouseEvent<SVGGElement>, tile: Tile) => void;
	onTileContextMenu?: (event: React.MouseEvent<SVGGElement>, tile: Tile) => void;
};

export type GenericTerrainComponentI<
	Terrain extends GenericTerrain<GenericTile> = GenericTerrain<GenericTile>,
	Tile extends GenericTile = GenericTile
> = FunctionComponent<
	{
		terrain: Terrain;
	} & GenericTerrainComponentProps<Tile>
>;
