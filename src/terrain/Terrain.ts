import { Coordinate } from '../classes/Coordinate';
import { TerrainI, TileFilter, TileI } from '../types';
import { Tile } from './Tile';

export class Terrain implements TerrainI {
	public readonly tiles: TileI[] = [];
	public readonly size: number;

	constructor(size: number, tiles: TileI[]) {
		this.tiles = tiles;
		this.size = size;
		// this.mesh = mesh;
		this.tiles.forEach((coordinate, i) => {
			coordinate.terrain = this;
		});
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

	public selectClosestTiles(start: TileI, maxDistance: number): TileI[] {
		return this.selectContiguousTiles(
			start,
			other => other.isLand() && start.euclideanDistanceTo(other) <= maxDistance,
			false
		);
	}

	private _islands: Map<TileFilter<TileI>, TileI[][]> = new Map();
	public getIslands(selector: TileFilter<TileI> = t => t.isLand()): TileI[][] {
		const fromCache = this._islands.get(selector);
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

		this._islands.set(selector, islands);
		return islands;
	}

	public getTileClosestToXy(x: number, y: number): TileI {
		if (!this.tiles.length) {
			throw new Error('Terrain is empty');
		}
		let closestDistance = Infinity;
		return this.tiles.reduce<TileI>((last, tile) => {
			const distance = tile.euclideanDistanceTo(x, y, 0);
			if (distance < closestDistance) {
				closestDistance = distance;
				return tile;
			} else {
				return last;
			}
		}, this.tiles[0]);
	}

	public getNeighborTiles(center: TileI): TileI[] {
		return center.neighbors;
	}

	public getMedianCoordinate() {
		const { x, y, z } = this.tiles.reduce(
			(totals, tile) => ({
				x: totals.x + tile.x,
				y: totals.y + tile.y,
				z: totals.z + tile.z
			}),
			{ x: 0, y: 0, z: 0 }
		);
		return new Coordinate(x / this.tiles.length, y / this.tiles.length, z / this.tiles.length);
	}

	static fromAscii(ascii: string) {
		const cleanString = ascii.trim().replace(/\t/g, '');

		const characters = cleanString.split('\n').map(line => line.split(''));
		const tiles = characters.map(line => new Array(line.length));
		const size = Math.max(
			characters.length,
			characters.reduce((max, line) => Math.max(max, line.length), 0)
		);

		characters.forEach((line, y) => {
			line.forEach((char, x) => {
				const tile = new Tile(x, y, char === 'X' ? 1 : -1);
				tiles[y][x] = tile;
				[tiles[y - 1]?.[x], tiles[y][x - 1], tiles[y + 1]?.[x], tiles[y][x + 1]]
					.filter(Boolean)
					.forEach(neighbor => {
						tile.neighbors.push(neighbor);
						neighbor.neighbors.push(tile);
					});
			});
		});

		return new Terrain(
			size,
			tiles.reduce((flat, line) => [...flat, ...line], [])
		);
	}
}
