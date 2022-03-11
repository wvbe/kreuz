import Color from 'color';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { activePalette } from '../constants/palettes';
import { perspective } from '../rendering/svg/perspective';
import { SvgMouseInteractionProps, TileI } from '../types';

const TERRAIN_FILL = Color(activePalette.medium).toString(); //color.terrain.string();
const TERRAIN_FILL_HIGHLIGHTED = Color(activePalette.light).toString();
const TERRAIN_FILL_WATER = 'transparent';
const TERRAIN_STROKE = Color(activePalette.darkest).toString(); // color.terrainStroke.string();
const TERRAIN_STROKE_WATER = Color(activePalette.dark - 0x111111).toString(); //color.terrainStroke.opaquer(-0.8).string();

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
			.map(n =>
				perspective
					.toPixels(tile.x + n.x, tile.y + n.y, tile.isLand() ? tile.z + n.z : -0.1)
					.join(',')
			)
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
			onMouseEnter={tile.isLand() ? () => setIsHovered(true) : undefined}
			onMouseLeave={tile.isLand() ? () => setIsHovered(false) : undefined}
		>
			{points}
		</g>
	);
};
