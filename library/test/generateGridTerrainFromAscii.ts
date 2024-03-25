import { SquareTile } from '../level-1/terrain/SquareTile.ts';
import { Terrain } from '../level-1/terrain/Terrain.ts';

const adjacency = [
	[-1, 0],
	[1, 0],
	[0, 1],
	[0, -1],
];

export function generateGridTerrainFromAscii(ascii: string) {
	const datas = ascii
		.trim()
		.split('\n')
		.map((line) => line.trim().split(''));
	if (!datas.every((data, i, all) => data.length === all[0].length)) {
		throw new Error('The ASCII input for generateGridTerrainFromAscii should be a rectangle');
	}

	const tiles = datas.map((data, y) =>
		data.map((character, x) => new SquareTile(x, y, character === '-' ? -1 : 1)),
	);

	tiles.forEach((tilesInRow, y) =>
		tilesInRow.forEach((tile, x) => {
			tile.neighbors.push(...adjacency.map(([dx, dy]) => tiles[y + dy]?.[x + dx]).filter(Boolean));
		}),
	);

	const terrain = new Terrain(
		0,
		tiles.reduce((flat, row) => flat.concat(row), []),
	);

	return terrain;
}
