import { Coordinate } from '../classes/Coordinate';
import { TerrainI, TileI } from '../types';
import { DualMeshTile } from './DualMeshTile';
import { GenericTerrain } from './GenericTerrain';

export class DualMeshTerrain extends GenericTerrain implements TerrainI {
	public size: number;

	constructor(size: number, tiles: TileI[]) {
		super(tiles);
		this.size = size;
		// this.mesh = mesh;
		this.tiles.forEach((coordinate, i) => {
			coordinate.terrain = this;
		});
	}

	getTileClosestToXy(x: number, y: number): TileI {
		const center = new Coordinate(x, y, 0);
		const { tile } = this.tiles.reduce<{ tile?: TileI; distance: number }>(
			(last, tile) => {
				const distance = center.euclideanDistanceTo(tile);
				return distance < last.distance ? { distance, tile } : last;
			},
			{ distance: Infinity }
		);
		if (!tile) {
			throw new Error('No tiles, ' + this.tiles.length);
		}
		return tile;
	}

	getNeighborTiles(center: TileI): TileI[] {
		return (center as DualMeshTile).neighbors || [];
	}
}
