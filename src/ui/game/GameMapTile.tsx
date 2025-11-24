import Color from 'color';
import { CSSProperties, FC, useMemo } from 'react';
import { MysteriousTerrain, TerrainDefinition } from '../../game/assets/terrains';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { surfaceComponent } from '../../game/core/ecs/components/surfaceComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { useEventedValue } from '../hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';
import { GraphicsCache } from './util/GraphicsCache';
import { usePregeneratedCanvasImage } from '../graphics/usePregeneratedCanvasImage';

export type WallMaterial = 'granite' | 'limestone' | 'clay' | 'dirt';
export type ExcavatedMaterial = 'dirt' | 'wood' | 'pebbles' | 'stones' | 'concrete';

/**
 * A component that maps a game tile to a presentational map location.
 *
 * This component uses the {@link MapLocation} presentational component to display the tile's location on the map.
 */
export const GameMapTile: FC<{
	tile: EcsEntity<
		typeof locationComponent | typeof surfaceComponent | typeof visibilityComponent
	>;
}> = ({ tile }) => {
	const surfaceType = useEventedValue(tile.surfaceType);

	// Calculate blended color based on material distribution
	const blendedColor = useMemo(() => {
		return new Color(surfaceType?.baseColor || 'black');
	}, [surfaceType]);

	const style = useMemo<CSSProperties>(
		() => ({
			backgroundColor: blendedColor.hex(),
		}),
		[blendedColor],
	);

	const graphicsUrl = usePregeneratedCanvasImage(surfaceType);

	if (surfaceType === MysteriousTerrain) {
		return null;
	}
	return (
		<MapLocation eventedQualifiedCoordinates={tile.location} dx={1} dy={1} style={style}>
			{graphicsUrl && <img src={graphicsUrl} />}
		</MapLocation>
	);
};
