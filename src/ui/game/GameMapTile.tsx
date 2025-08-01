import Color from 'color';
import { CSSProperties, FC, MouseEventHandler, useCallback, useMemo } from 'react';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { surfaceComponent, SurfaceType } from '../../game/core/ecs/components/surfaceComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { useEventedValue } from '../hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';
import { useGameContextMenuOpener } from './GameContextMenu';
import { useTileHighlights } from './hooks/useTileHighlights';
import { getMaterialDistribution } from './util/materialDistribution';

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
	tile: EcsEntity<
		typeof locationComponent | typeof surfaceComponent | typeof visibilityComponent
	>;
	onMouseDown?: MouseEventHandler<HTMLDivElement>;
	onMouseEnter?: MouseEventHandler<HTMLDivElement>;
	onMouseLeave?: MouseEventHandler<HTMLDivElement>;
	onMouseUp?: MouseEventHandler<HTMLDivElement>;
}> = ({ tile, onMouseDown, onMouseEnter, onMouseLeave, onMouseUp }) => {
	const location = useEventedValue(tile.location);
	const { isHighlighted, highlightColor } = useTileHighlights(tile);
	const surfaceType = useEventedValue(tile.surfaceType);

	const isExcavated = surfaceType === SurfaceType.OPEN;

	const distribution = useMemo(() => {
		return getMaterialDistribution(location[1], location[2]);
	}, [location]);

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

		const color = new Color({ r, g, b }).darken(isExcavated ? 0 : 0.6);
		if (isHighlighted) {
			return color.mix(highlightColor, 0.5);
		}
		return color;
	}, [distribution, isExcavated, isHighlighted, highlightColor]);

	const contextMenu = useGameContextMenuOpener();

	const onRmb = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			// contextMenu.open(event, { tile });
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
			eventedQualifiedCoordinates={tile.location}
			dx={1}
			dy={1}
			onContextMenu={onRmb}
			style={style}
			onMouseDown={onMouseDown}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onMouseUp={onMouseUp}
		/>
	);
};
