import { distanceToCameraComparator } from '../space/PERSPECTIVE';
import { generateTerrain as generateHelloWorldTerrain } from '../generators/hello-world';
import { TerrainCoordinate } from './TerrainCoordinate';
type IslandFilter = (coordinate: TerrainCoordinate) => boolean;
export class Terrain {
	public readonly coordinates: TerrainCoordinate[];
	private coordinatesInRenderOrder: TerrainCoordinate[] | null = null;
	private readonly size: number;

	private islands: Map<IslandFilter, TerrainCoordinate[][]> = new Map();

	constructor(coordinates: TerrainCoordinate[]) {
		this.coordinates = coordinates;
		this.coordinates.forEach(coordinate => (coordinate.terrain = this));

		this.size = Math.sqrt(this.coordinates.length);
	}

	private getIndexForXy(x: number, y: number) {
		return this.size * y + x;
	}

	/**
	 * Select all neighbouring points that connect to one another, like an island.
	 */
	public selectContiguousNeigbors(
		start: TerrainCoordinate,
		selector: IslandFilter = c => c.isLand()
	) {
		const island: TerrainCoordinate[] = [];
		const seen: TerrainCoordinate[] = [];
		const queue: TerrainCoordinate[] = [start];

		while (queue.length) {
			const current = queue.shift() as TerrainCoordinate;
			island.push(current);

			const neighbours = this.getNeighbors(current).filter(n => !seen.includes(n));
			seen.splice(0, 0, current, ...neighbours);
			queue.splice(0, 0, ...neighbours.filter(selector));
		}
		return island;
	}

	/**
	 * Get all distinct contiguous groups of cells
	 */
	public getIslands(selector: (coordinate: TerrainCoordinate) => boolean = c => c.isLand()) {
		const fromCache = this.islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.coordinates.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as TerrainCoordinate;
			if (!selector(next)) {
				continue;
			}
			const island = this.selectContiguousNeigbors(next, selector);
			open = open.filter(n => !island.includes(n));
			islands.push(island);
		}

		this.islands.set(selector, islands);
		return islands;
	}

	public getAtXy(x: number, y: number) {
		if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) {
			// Out of bounds
			return;
		}
		return this.coordinates[this.getIndexForXy(x, y)];
	}

	public getNeighbors(center: TerrainCoordinate) {
		return [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1]
			// Diagonal neigbors not included
		]
			.map(([dx, dy]) => this.getAtXy(center.x + dx, center.y + dy))
			.filter(Boolean) as TerrainCoordinate[];
	}

	public getCoordinatesInRenderOrder() {
		if (!this.coordinatesInRenderOrder) {
			this.coordinatesInRenderOrder = this.coordinates
				.slice()
				.sort(distanceToCameraComparator);
		}
		return this.coordinatesInRenderOrder;
	}

	static generateRandom(seed: string, size: number) {
		return generateHelloWorldTerrain(seed, size);
	}
}
