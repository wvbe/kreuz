import { Collection, EcsEntity, Game, locationComponent, visibilityComponent } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { byEcsComponents } from '../../library/level-1/ecs/assert.ts';
import { MapTileContextMenuHost } from '../context-menu/MAP_TILE_CONTEXT_MENU.ts';
import { useCollection } from '../hooks/useEventedValue.ts';
import { MapEntity } from './MapEntity.tsx';
import { MapTile } from './MapTile.tsx';

const SVG_PADDING = 25;

export const MapTerrain: FunctionComponent<{
	terrain: Game['terrain'];
	entities: Collection<EcsEntity<any>>;
}> = ({ terrain, entities }) => {
	const zoom = 32;

	const tileCollection = useCollection(terrain.tiles);
	const tiles = useMemo(
		() => tileCollection.map((tile) => <MapTile key={tile.id} zoom={zoom} tile={tile} />),
		[tileCollection],
	);
	const boundaries = useMemo(() => {
		const boundaries = tileCollection.reduce(
			(b, tile) => {
				const [x, y] = tile.location.get();
				return {
					minX: Math.min(b.minX, x),
					maxX: Math.max(b.maxX, x),
					minY: Math.min(b.minY, y),
					maxY: Math.max(b.maxY, y),
				};
			},
			{ minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
		);
		return boundaries;
	}, [tileCollection]);

	const entitiesCollection = useCollection(entities);
	const entities2 = useMemo(
		() =>
			entitiesCollection
				.filter(byEcsComponents([locationComponent, visibilityComponent]))
				.map((entity) => <MapEntity key={entity.id} entity={entity} zoom={zoom} />),
		[entitiesCollection],
	);

	const [terrainCss, svgProps, overlayCss, svgCss] = useMemo(() => {
		const minPxX = boundaries.minX * zoom;
		const minPxY = boundaries.minY * zoom;
		const maxPxX = boundaries.maxX * zoom;
		const maxPxY = boundaries.maxY * zoom;
		const width = (boundaries.maxX - boundaries.minX) * zoom + 2 * SVG_PADDING;
		const height = (boundaries.maxY - boundaries.minY) * zoom + 2 * SVG_PADDING;
		return [
			{
				width: 0, //`${width}px`,
				height: 0, //`${height}px`,
			} as React.CSSProperties,
			{
				width,
				height,
				viewBox: `${-SVG_PADDING + minPxX} ${-SVG_PADDING + minPxY} ${width} ${height}`,
			},
			{
				position: 'absolute',
				top: 0,
				left: 0,
				// zIndex: 0,
			} as React.CSSProperties,
			{
				position: 'absolute',
				top: minPxY - SVG_PADDING,
				left: minPxX - SVG_PADDING,
				// zIndex: 0,
			} as React.CSSProperties,
		];
	}, [boundaries]);

	return (
		<div className="map-terrain" style={terrainCss} data-context-menu-role="canvas">
			<MapTileContextMenuHost>
				<svg {...svgProps} style={svgCss}>
					<g className="tiles">{tiles}</g>
					<g className="outline">{/* <MapTerrainOutline terrain={terrain} /> */}</g>
				</svg>
				<div style={overlayCss}>{entities2}</div>
			</MapTileContextMenuHost>
		</div>
	);
};
