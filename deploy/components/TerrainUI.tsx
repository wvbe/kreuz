import { FunctionComponent, useMemo } from 'react';
import { Collection, Entity, EntityI, PersonEntity, type TerrainI, type TileI } from '@lib';
import { useWindowSize } from '~/hooks/useWindowSize.ts';
import { PersonEntityUI } from './PersonEntityUI.tsx';

const Tile: FunctionComponent<{ tile: TileI }> = ({ tile }) => {
	const zoom = 10;
	const points = useMemo(
		() =>
			tile
				.getOutlineCoordinates()
				.map((coord) => `${(tile.x + coord.x) * zoom},${(tile.y + coord.y) * zoom}`)
				.join(' '),
		[],
	);
	if (!tile.isLand()) {
		return null;
	}
	return (
		<polygon
			points={points}
			style={{ fill: 'rgba(0,0,0,0.1)', stroke: 'black', strokeWidth: 0.5 }}
		/>
	);
};

export const TerrainUI: FunctionComponent<{ terrain: TerrainI; entities: Collection<EntityI> }> = ({
	terrain,
	entities,
}) => {
	const tiles = useMemo(
		() => terrain.tiles.map((tile, i) => <Tile tile={tile} key={i} />),
		[terrain.tiles],
	);
	const entities2 = useMemo(
		() =>
			entities
				.filter<PersonEntity>((e) => e instanceof PersonEntity)
				.map((entity, i) => <PersonEntityUI key={i} person={entity} />),
		[],
	);
	// const [width, height] = useWindowSize();
	return (
		<svg height={480} width={640} viewBox="0 20 200 170">
			{tiles}
			{entities2}
		</svg>
	);
};
