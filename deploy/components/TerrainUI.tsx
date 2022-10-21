import { Collection, EntityI, type Terrain } from '@lib';
import { DetailedHTMLProps, FunctionComponent, HTMLAttributes, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';

const MARGIN = 15;
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
			style={{ top: `${y * zoom + MARGIN}px`, left: `${x * zoom + MARGIN}px` }}
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

	const boundaries = useMemo(
		() =>
			terrain.tiles.reduce(
				(b, tile) => ({
					minX: Math.min(b.minX, tile.x),
					maxX: Math.max(b.minX, tile.x),
					minY: Math.min(b.minY, tile.y),
					maxY: Math.max(b.minY, tile.y),
				}),
				{
					minX: Infinity,
					maxX: -Infinity,
					minY: Infinity,
					maxY: -Infinity,
				},
			),
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

	const width = (boundaries.maxX - boundaries.minX) * zoom + 2 * MARGIN;
	const height = (boundaries.maxY - boundaries.minY) * zoom + 2 * MARGIN;

	return (
		<div
			className="terrain"
			style={{
				width: `${width}px`,
				height: `${height}px`,
			}}
		>
			<svg height={height} width={width} viewBox={`${-MARGIN} ${-MARGIN} ${width} ${height}`}>
				{tiles}
			</svg>
			{entities2}
		</div>
	);
};
