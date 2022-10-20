import { Collection, EntityI, type Terrain } from '@lib';
import { DetailedHTMLProps, FunctionComponent, HTMLAttributes, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';

const width = 640,
	height = 480;

export const EntityMarker: FunctionComponent<
	{ entity: EntityI; zoom: number } & DetailedHTMLProps<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>
> = ({ entity, zoom, ...rest }) => {
	const { x, y } = useEventedValue(entity.$$location);
	return (
		<div
			className="person-entity-marker"
			style={{ top: `${y * zoom}px`, left: `${x * zoom}px` }}
			{...rest}
		/>
	);
};

export const TerrainUI: FunctionComponent<{ terrain: Terrain; entities: Collection<EntityI> }> = ({
	terrain,
	entities,
}) => {
	const zoom = 25;

	const tiles = useMemo(
		() =>
			terrain.tiles.map((tile, i) => {
				if (!tile.isLand()) {
					return null;
				}
				const points = tile
					.getOutlineCoordinates()
					.map((coord) => `${(tile.x + coord.x) * zoom},${(tile.y + coord.y) * zoom}`)
					.join(' ');
				return <polygon key={i} points={points} />;
			}),
		[terrain.tiles],
	);

	const entities2 = useMemo(
		() =>
			entities.map((entity, i) => {
				const className = `entity-marker--${entity.type}`;
				return (
					<EntityMarker key={entity.id} entity={entity} zoom={zoom} className={className}>
						{entity.icon}
					</EntityMarker>
				);
			}),
		[],
	);

	return (
		<div className="terrain" style={{ width: `${width}px`, height: `${height}px` }}>
			<svg height={480} width={640}>
				{tiles}
			</svg>
			{entities2}
		</div>
	);
};
