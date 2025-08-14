import { GrassTerrain, MysteriousTerrain, TerrainDefinition } from '../assets/terrains';
import { locationComponent } from '../core/ecs/components/locationComponent';
import { outlineComponent } from '../core/ecs/components/outlineComponent';
import { pathableComponent } from '../core/ecs/components/pathableComponent';
import { surfaceComponent } from '../core/ecs/components/surfaceComponent';
import { EcsEntity } from '../core/ecs/types';
import { SimpleCoordinate } from '../core/terrain/types';

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

type GeneratedTile = {
	location: SimpleCoordinate;
	surfaceType: TerrainDefinition;
};

export function generateGridTerrainFromAscii(ascii: string): GeneratedTile[] {
	const datas = ascii
		.trim()
		.split('\n')
		.map((line) => line.trim().split(''));
	if (!datas.every((data, i, all) => data.length === all[0].length)) {
		throw new Error('The ASCII input for generateGridTerrainFromAscii should be a rectangle');
	}

	const tiles = datas.map((data, y) =>
		data.map((character, x) =>
			character === '-'
				? null
				: {
						location: [x, y, character === '-' ? -1 : 1] as SimpleCoordinate,
						surfaceType: character === '-' ? MysteriousTerrain : GrassTerrain,
				  },
		),
	);

	return tiles.flatMap((row) => row).filter((t): t is GeneratedTile => t !== null);
}
