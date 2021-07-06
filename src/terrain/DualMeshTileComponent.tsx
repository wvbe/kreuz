import React, { FunctionComponent, useMemo, useState } from 'react';
import { PERSPECTIVE } from '../space/PERSPECTIVE';
import { color } from '../styles';
import { SvgMouseInteractionProps } from '../types';
import { DualMeshTerrain, DualMeshTile } from './DualMeshTerrain';
import { GenericTerrainComponentI } from './GenericTerrain';

const TERRAIN_FILL = color.terrain.string();
const TERRAIN_FILL_HIGHLIGHTED = color.highlightedTerrain.string();
const TERRAIN_FILL_WATER = 'transparent';
const TERRAIN_STROKE = color.terrainStroke.string();
const TERRAIN_STROKE_WATER = color.terrainStroke.opaquer(-0.5).string();
export const DualMeshTileComponent: FunctionComponent<
	SvgMouseInteractionProps & {
		tile: DualMeshTile;
	}
> = ({ tile, ...svgProps }) => {
	const [isHovered, setIsHovered] = useState(false);
	const points = useMemo(() => {
		if (!tile.isLand() && !tile.neighbors?.some((n) => n.isLand())) {
			return;
		}
		if (!tile.outlinePoints || tile.outlinePoints.length < 3) {
			throw new Error('Not a polygon');
		}
		const points = [...tile.outlinePoints, tile.outlinePoints[0]]
			.map((n) => PERSPECTIVE.toPixels(n.x, n.y, n.z).join(','))
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
	const terrainElements = useMemo(
		() =>
			terrain.getTilesInRenderOrder().map((tile) => (
				<DualMeshTileComponent
					key={tile.toString()}
					tile={tile}
					onClick={
						onTileClick
							? (event) => {
									event.preventDefault();
									event.stopPropagation();
									onTileClick(event, tile);
							  }
							: onTileClick
					}
					onContextMenu={
						onTileContextMenu
							? (event) => {
									event.preventDefault();
									onTileContextMenu(event, tile);
							  }
							: onTileContextMenu
					}
				/>
			)),
		[terrain, onTileClick, onTileContextMenu]
	);
	return <g className="dual-mesh-terrain">{terrainElements}</g>;
};
