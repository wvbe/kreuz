import { distanceToCameraComparator } from '../space/PERSPECTIVE';
import { TerrainCoordinate } from './TerrainCoordinate';
import { OUT_OF_BOUNDS, TerrainGenerator } from './TerrainGenerator';

export class Terrain {
	public readonly coordinates: TerrainCoordinate[];
	private coordinatesInRenderOrder: TerrainCoordinate[] | null = null;
	private readonly size: number;

	constructor(coordinates: TerrainCoordinate[]) {
		this.coordinates = coordinates;
		this.coordinates.forEach(coordinate => (coordinate.terrain = this));

		this.size = Math.sqrt(this.coordinates.length);
	}

	private getIndexForXy(x: number, y: number) {
		return this.size * y + x;
	}

	public selectContiguousNeigbors(
		start: TerrainCoordinate,
		selector: (coordinate: TerrainCoordinate) => boolean = c => c.canWalkHere()
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

	public getIslands(selector: (coordinate: TerrainCoordinate) => boolean = c => c.canWalkHere()) {
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
		const generator = new TerrainGenerator(seed, size);
		generator.generate(1);

		// For clarity, the terrain must currently always be square
		// @TODO fix that some time.
		const width = size,
			height = size;

		const coordinates = Array.from(new Array(width * height)).map<[number, number, number]>(
			(_, i) => {
				const x = i % width;
				const y = Math.floor(i / width);
				const z = generator.get(x, y);
				if (z === OUT_OF_BOUNDS) {
					throw new Error(`Out of bounds @ ${x}, ${y}`);
				}
				return [x, y, (2 * (z as number)) / size];
			}
		);

		const sortedHeights = coordinates.map(coordinate => coordinate[2]).sort();
		const RATIO_WATER_OF_TOTAL = 0.25;
		const waterlineOffset =
			sortedHeights[Math.floor(sortedHeights.length * RATIO_WATER_OF_TOTAL)];
		return new Terrain(
			coordinates.map(([x, y, z]) => new TerrainCoordinate(x, y, z - waterlineOffset))
		);
	}
}
