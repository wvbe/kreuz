import Color from 'color';
import React, { CSSProperties, FC, MouseEventHandler, useCallback, useMemo } from 'react';
import { locationComponent } from '../../lib/level-1/ecs/components/locationComponent';
import { surfaceComponent, SurfaceType } from '../../lib/level-1/ecs/components/surfaceComponent';
import { getMaterialDistribution } from '../../lib/level-1/ecs/components/surfaceComponent/materialDistribution';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { useEventedValue } from '../../ui/hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';
import { useGameContextMenuOpener } from './GameContextMenu';

export type WallMaterial = 'granite' | 'limestone' | 'clay' | 'dirt';
export type ExcavatedMaterial = 'dirt' | 'wood' | 'pebbles' | 'stones' | 'concrete';

// Material color definitions
const MATERIAL_COLORS = {
	wall: {
		granite: new Color('#2C2C2C'),
		limestone: new Color('#D8D8D8'),
		clay: new Color('#8B4513'),
		dirt: new Color('#8B4513'),
	},
	excavated: {
		dirt: new Color('#8B4513'),
		wood: new Color('#8B4513'),
		pebbles: new Color('#808080'),
		stones: new Color('#696969'),
		concrete: new Color('#A9A9A9'),
	},
};

/**
 * A component that maps a game tile to a presentational map location.
 *
 * This component uses the {@link MapLocation} presentational component to display the tile's location on the map.
 */
export const GameMapTile: FC<{
	tile: EcsEntity<typeof locationComponent | typeof surfaceComponent>;
}> = ({ tile }) => {
	const location = useEventedValue(tile.location);

	const surfaceType = useEventedValue(tile.surfaceType);
	const isExcavated = surfaceType === SurfaceType.OPEN;
	const distribution = useMemo(
		() => getMaterialDistribution(location[0], location[1]),
		[location],
	);

	// Calculate blended color based on material distribution
	const blendedColor = useMemo(() => {
		const materials = isExcavated ? distribution.excavated : distribution.wall;
		const colors = isExcavated ? MATERIAL_COLORS.excavated : MATERIAL_COLORS.wall;

		let r = 0,
			g = 0,
			b = 0;

		Object.entries(materials).forEach(([material, weight]) => {
			const color = colors[material as keyof typeof colors];
			r += color.red() * weight;
			g += color.green() * weight;
			b += color.blue() * weight;
		});

		return new Color({ r, g, b }).darken(isExcavated ? 0 : 0.6);
	}, [distribution, isExcavated]);

	const contextMenu = useGameContextMenuOpener();

	const onRmb = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			return;
			console.log('Hm');
			contextMenu.open(event, { tile });
		},
		[contextMenu],
	);

	const style = useMemo<CSSProperties>(
		() => ({
			backgroundColor: blendedColor.hex(),
			// borderRadius: '0.2em',
			boxShadow: isExcavated
				? 'inset -2px -2px rgba(0, 0, 0, 0.3), inset 2px 2px rgba(255, 255, 255, 0.1)'
				: 'inset -2px -2px rgba(0, 0, 0, 0.2), inset 2px 2px rgba(255, 255, 255, 0.1)',
		}),
		[blendedColor, isExcavated],
	);

	return (
		<MapLocation
			x={location[0]}
			y={location[1]}
			dx={1}
			dy={1}
			onContextMenu={onRmb}
			style={style}
		/>
	);
};
