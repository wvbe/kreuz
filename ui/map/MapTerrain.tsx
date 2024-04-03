import {
	Collection,
	EcsEntity,
	Game,
	TerrainI,
	locationComponent,
	visibilityComponent,
} from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { MapTileContextMenuHost } from '../context-menu/MAP_TILE_CONTEXT_MENU.ts';
import { MapEntity } from './MapEntity.tsx';
import { MapTile } from './MapTile.tsx';

const SVG_PADDING = 25;

export const MapTerrain: FunctionComponent<{
	terrain: Game['terrain'];
	entities: Collection<EcsEntity>;
}> = ({ terrain, entities }) => {
	const zoom = 32;

	const tiles = useMemo(
		() => terrain.tiles.map((tile, i) => <MapTile key={i} zoom={zoom} tile={tile} />),
		[terrain.tiles],
	);

	const boundaries = useMemo(
		() =>
			terrain.tiles.reduce(
				(b, tile) => {
					const [x, y] = tile.location.get();
					return {
						minX: Math.min(b.minX, x),
						maxX: Math.max(b.minX, x),
						minY: Math.min(b.minY, y),
						maxY: Math.max(b.minY, y),
					};
				},
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
			entities
				.filter<EcsEntity<typeof locationComponent | typeof visibilityComponent>>(
					(entity) => locationComponent.test(entity) && visibilityComponent.test(entity),
				)
				.map((entity, i) => <MapEntity key={entity.id} entity={entity} zoom={zoom} />),
		[],
	);

	const [terrainCss, svgProps, overlayCss] = useMemo(() => {
		const width = (boundaries.maxX - boundaries.minX) * zoom + 2 * SVG_PADDING;
		const height = (boundaries.maxY - boundaries.minY) * zoom + 2 * SVG_PADDING;
		return [
			{
				width: `${width}px`,
				height: `${height}px`,
			} as React.CSSProperties,
			{
				width,
				height,
				viewBox: `${-SVG_PADDING} ${-SVG_PADDING} ${width} ${height}`,
			},
			{
				position: 'absolute',
				top: SVG_PADDING,
				left: SVG_PADDING,
				// zIndex: 0,
			} as React.CSSProperties,
		];
	}, []);

	return (
		<div className="map-terrain" style={terrainCss} data-context-menu-role="canvas">
			<MapTileContextMenuHost>
				<svg {...svgProps}>
					<g className="tiles">{tiles}</g>
					<g className="outline">{/* <MapTerrainOutline terrain={terrain} /> */}</g>
				</svg>
				<div style={overlayCss}>{entities2}</div>
			</MapTileContextMenuHost>
		</div>
	);
};
