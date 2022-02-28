import React, { FunctionComponent, useMemo, useState } from 'react';
import { PERSPECTIVE } from '../space/PERSPECTIVE';
import { color } from '../styles';
import { SvgMouseInteractionProps, TileI } from '../types';

const TERRAIN_FILL = color.terrain.string();
const TERRAIN_FILL_HIGHLIGHTED = color.beach.string();
const TERRAIN_FILL_WATER = 'transparent';
const TERRAIN_STROKE = color.terrainStroke.string();
const TERRAIN_STROKE_WATER = color.terrainStroke.opaquer(-0.8).string();

export const DualMeshTileC: FunctionComponent<
	SvgMouseInteractionProps & {
		tile: TileI;
	}
> = ({ tile, ...svgProps }) => {
	const [isHovered, setIsHovered] = useState(false);
	const points = useMemo(() => {
		if (!tile.isLand() && !tile.isAdjacentToLand()) {
			return;
		}
		const outline = tile.getOutlineCoordinates();
		const points = [...outline, outline[0]]
			.map(n => PERSPECTIVE.toPixels(tile.x + n.x, tile.y + n.y, tile.z + n.z).join(','))
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
