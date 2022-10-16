import { SquareTile, Terrain } from '@lib';

const adjacency = [
	[-1, 0],
	[1, 0],
	[0, 1],
	[0, -1],
];

/**
 * @deprecated Only here as a test convenience.
 */
export function generateGridTerrainFromAscii(ascii: string) {
	const datas = ascii
		.trim()
		.split('\n')
		.map((line) => line.trim().split(''));
	if (!datas.every((data, i, all) => data.length === all[0].length)) {
		throw new Error('The ASCII input for generateGridTerrainFromAscii should be a rectangle');
	}

	const tiles = datas.map((data, y) =>
		data.map((character, x) => {
			const z = character === '-' ? -1 : 1;
			const tile = new SquareTile(x, y, z);
			return tile;
		}),
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
