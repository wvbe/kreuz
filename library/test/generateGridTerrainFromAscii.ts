import { Coordinate } from '../level-1/terrain/Coordinate.ts';
import { Terrain } from '../level-1/terrain/Terrain.ts';
import {
	EcsEntity,
	locationComponent,
	outlineComponent,
	pathableComponent,
	surfaceComponent,
} from '@lib/core';

const adjacency = [
	[-1, 0],
	[1, 0],
	[0, 1],
	[0, -1],
];

type TileEntity = EcsEntity<
	| typeof locationComponent
	| typeof outlineComponent
	| typeof surfaceComponent
	| typeof pathableComponent
>;
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
			const entity = { id: x };
			locationComponent.attach(entity, { location: [x, y, character === '-' ? -1 : 1] });
			pathableComponent.attach(entity, { walkability: character === '-' ? 0 : 1 });
			outlineComponent.attach(entity, {
				outlineCoordinates: [
					[-0.5, -0.5],
					[0.5, -0.5],
					[0.5, 0.5],
					[-0.5, 0.5],
				].map(([x, y]) => new Coordinate(x, y, 0)),
			});
			return entity as TileEntity;
		}),
	);

	tiles.forEach((tilesInRow, y) =>
		tilesInRow.forEach((tile, x) => {
			tile.pathingNeighbours.push(
				...adjacency.map(([dx, dy]) => tiles[y + dy]?.[x + dx]).filter(Boolean),
			);
		}),
	);

	const terrain = new Terrain(
		0,
		tiles.reduce((flat, row) => flat.concat(row), []),
	);

	return terrain;
}
