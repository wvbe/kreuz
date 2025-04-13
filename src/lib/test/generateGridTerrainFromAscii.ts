import {
	SurfaceType,
	locationComponent,
	outlineComponent,
	pathableComponent,
	surfaceComponent,
	tileArchetype,
} from '../level-1/ecs/components';
import { EcsArchetypeEntity, EcsEntity } from '../level-1/ecs/ecs';

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
export function generateGridTerrainFromAscii(
	ascii: string,
): EcsArchetypeEntity<typeof tileArchetype>[] {
	const datas = ascii
		.trim()
		.split('\n')
		.map((line) => line.trim().split(''));
	if (!datas.every((data, i, all) => data.length === all[0].length)) {
		throw new Error('The ASCII input for generateGridTerrainFromAscii should be a rectangle');
	}

	const tiles = datas.map((data, y) =>
		data.map((character, x) =>
			tileArchetype.create({
				location: [x, y, character === '-' ? -1 : 1],
				outlineCoordinates: [
					[-0.5, -0.5, 0],
					[0.5, -0.5, 0],
					[0.5, 0.5, 0],
					[-0.5, 0.5, 0],
				],
				surfaceType: character === '-' ? SurfaceType.UNKNOWN : SurfaceType.OPEN,
			}),
		),
	);

	tiles.forEach((tilesInRow, y) =>
		tilesInRow.forEach((tile, x) => {
			tile.pathingNeighbours.push(
				...adjacency.map(([dx, dy]) => tiles[y + dy]?.[x + dx]).filter(Boolean),
			);
		}),
	);

	return tiles.reduce((flat, row) => flat.concat(row), []);
}
