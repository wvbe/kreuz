import { FunctionComponent } from 'react';
import { distanceToCameraComparator } from '../constants/perspective';
import { TerrainI, TileFilter, TileI } from '../types';

export class GenericTerrain implements TerrainI {
	/**
	 * Private
	 */

	//

	/**
	 * Public, shared code
	 */

	public readonly tiles: TileI[] = [];

	//

	constructor(tiles: TileI[]) {
		this.tiles = tiles;
	}

	public selectContiguousTiles(
		start: TileI,
		selector: TileFilter<TileI> = c => c.isLand(),
		inclusive: boolean
	): TileI[] {
		const island: TileI[] = [];
		const seen: TileI[] = [];
		const queue: TileI[] = [start];

		while (queue.length) {
			const current = queue.shift() as TileI;
			if (inclusive || current !== start) {
				island.push(current);
			}

			const neighbours = this.getNeighborTiles(current).filter(n => !seen.includes(n));
			seen.splice(0, 0, current, ...neighbours);
			queue.splice(0, 0, ...neighbours.filter(selector));
		}
		return island;
	}

	//
	public selectClosestTiles(start: TileI, maxDistance: number): TileI[] {
		return this.selectContiguousTiles(
			start,
			other => other.isLand() && start.euclideanDistanceTo(other) <= maxDistance,
			false
		);
	}

	//
	protected islands: Map<TileFilter<TileI>, TileI[][]> = new Map();
	public getIslands(selector: TileFilter<TileI> = t => t.isLand()): TileI[][] {
		const fromCache = this.islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.tiles.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as TileI;
			if (!selector(next)) {
				continue;
			}
			const island = this.selectContiguousTiles(next, selector, true);
			open = open.filter(n => !island.includes(n));
			islands.push(island);
		}

		this.islands.set(selector, islands);
		return islands;
	}

	private _tilesInRenderOrder: TileI[] | null = null;
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
	public Component: TerrainI['Component'] = () => {
		throw new Error('Not implemented');
	};

	//
	public getTileClosestToXy(x: number, y: number): TileI {
		throw new Error('Not implemented');
	}

	//
	public getNeighborTiles(center: TileI): TileI[] {
		return this.tiles.filter(tile => center.manhattanDistanceTo(tile) === 1);
	}

	/**
	 * Statics
	 */

	//
	static generateRandom(seed: string, size: number): GenericTerrain {
		throw new Error('Not implemented');
	}
}

export type GenericTerrainComponentProps<Tile extends TileI> = {
	onTileClick?: (event: React.MouseEvent<SVGGElement>, tile: Tile) => void;
	onTileContextMenu?: (event: React.MouseEvent<SVGGElement>, tile: Tile) => void;
};

export type GenericTerrainComponentI<Terrain extends TerrainI, Tile extends TileI> =
	FunctionComponent<
		{
			terrain: Terrain;
		} & GenericTerrainComponentProps<Tile>
	>;
