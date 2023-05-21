import { Collection, EntityI, type Terrain } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { MapEntity } from './MapEntity.tsx';
import { MapTile } from './MapTile.tsx';
import { MapTerrainOutline } from './MapTerrainOutline.tsx';

const MARGIN = 25;

export const MapTerrain: FunctionComponent<{ terrain: Terrain; entities: Collection<EntityI> }> = ({
	terrain,
	entities,
}) => {
	const zoom = 32;

	const tiles = useMemo(
		() => terrain.tiles.map((tile, i) => <MapTile key={i} zoom={zoom} tile={tile} />),
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
		() => entities.map((entity, i) => <MapEntity key={entity.id} entity={entity} zoom={zoom} />),
		[],
	);

	const [terrainCss, svgProps, overlayCss] = useMemo(() => {
		const width = (boundaries.maxX - boundaries.minX) * zoom + 2 * MARGIN;
		const height = (boundaries.maxY - boundaries.minY) * zoom + 2 * MARGIN;
		return [
			{
				width: `${width}px`,
				height: `${height}px`,
			} as React.CSSProperties,
			{
				width,
				height,
				viewBox: `${-MARGIN} ${-MARGIN} ${width} ${height}`,
			},
			{
				position: 'absolute',
				top: MARGIN,
				left: MARGIN,
			} as React.CSSProperties,
		];
	}, []);

	return (
		<div className="map-terrain" style={terrainCss}>
			<svg {...svgProps}>
				<g className="tiles">{tiles}</g>
				{/* <g className="outline">
					<MapTerrainOutline terrain={terrain} />
				</g> */}
			</svg>
			<div style={overlayCss}>{entities2}</div>
		</div>
	);
};
