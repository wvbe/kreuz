import React, { FunctionComponent, useMemo, useState } from 'react';
import { PERSPECTIVE } from '../space/PERSPECTIVE';
import { color } from '../styles';
import { SvgMouseInteractionProps } from '../types';
import { DualMeshTerrain, DualMeshTile } from './DualMeshTerrain';
import { GenericTerrainComponentI } from './GenericTerrain';

const TERRAIN_FILL = color.terrain.string();
const TERRAIN_FILL_HIGHLIGHTED = color.beach.string();
const TERRAIN_FILL_WATER = 'transparent';
const TERRAIN_STROKE = color.terrainStroke.string();
const TERRAIN_STROKE_WATER = color.terrainStroke.opaquer(-0.8).string();

const DualMeshTileComponent: FunctionComponent<
	SvgMouseInteractionProps & {
		tile: DualMeshTile;
	}
> = ({ tile, ...svgProps }) => {
	const [isHovered, setIsHovered] = useState(false);
	const points = useMemo(() => {
		if (!tile.isLand() && !tile._neighbors?.some(n => n.isLand())) {
			return;
		}
		if (!tile._outlinePoints || tile._outlinePoints.length < 3) {
			throw new Error('Not a polygon');
		}
		const points = [...tile._outlinePoints, tile._outlinePoints[0]]
			.map(n => PERSPECTIVE.toPixels(n.x, n.y, tile.z).join(','))
			.join(' ');

		return <polygon points={points} />;
	}, [tile]);

	if (!points) {
		return null;
	}
	return (
		<g
			className="dual-mesh-tile"
			fill={
				tile.isLand()
					? isHovered
						? TERRAIN_FILL_HIGHLIGHTED
						: TERRAIN_FILL
					: TERRAIN_FILL_WATER
			}
			stroke={tile.isLand() ? TERRAIN_STROKE : TERRAIN_STROKE_WATER}
			{...svgProps}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{points}
		</g>
	);
};

export const DualMeshTerrainComponent: GenericTerrainComponentI<DualMeshTerrain, DualMeshTile> = ({
	terrain,
	onTileClick,
	onTileContextMenu
}) => {
	const pathElements = useMemo(() => {
		const seen: DualMeshTile[] = [];

		return terrain.tiles
			.reduce<[DualMeshTile, DualMeshTile][]>((connections, origin) => {
				seen.push(origin);
				return origin.isLand()
					? connections.concat(
							terrain
								.getNeighborTiles(origin)
								.filter(target => target.isLand())
								.filter(target => !seen.includes(target))
								.map(target => [origin, target])
					  )
					: connections;
			}, [])
			.map(coords => coords.map(c => PERSPECTIVE.toPixels(c.x, c.y, c.z)))
			.map(([origin, target]) => (
				<line
					key={`${origin}x${target}`}
					x1={origin[0]}
					y1={origin[1]}
					x2={target[0]}
					y2={target[1]}
					stroke={color.terrainStroke.opaquer(-0.6).string()}
					strokeDasharray="3"
				/>
			));
	}, [terrain]);
	const terrainElements = useMemo(
		() =>
			terrain.getTilesInRenderOrder().map(tile => (
				<DualMeshTileComponent
					key={tile.toString()}
					tile={tile}
					onClick={
						onTileClick
							? event => {
									event.preventDefault();
									event.stopPropagation();
									onTileClick(event, tile);
							  }
							: onTileClick
					}
					onContextMenu={
						onTileContextMenu
							? event => {
									event.preventDefault();
									onTileContextMenu(event, tile);
							  }
							: onTileContextMenu
					}
				/>
			)),
		[terrain, onTileClick, onTileContextMenu]
	);
	return (
		<g className="dual-mesh-terrain">
			<g className="dual-mesh-terrain__tiles">{terrainElements}</g>
			<g className="dual-mesh-terrain__paths">{pathElements}</g>
		</g>
	);
};
