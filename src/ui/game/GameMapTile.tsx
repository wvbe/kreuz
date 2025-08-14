import Color from 'color';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import {
	DeepWaterTerrain,
	GrassTerrain,
	MysteriousTerrain,
	SandTerrain,
	ShallowWaterTerrain,
	TerrainDefinition,
} from '../../game/assets/terrains';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { surfaceComponent } from '../../game/core/ecs/components/surfaceComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { createSandGraphic } from '../graphics/createSandGraphic';
import { createWaveGraphic } from '../graphics/createWaveGraphic';
import { useEventedValue } from '../hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';
import { GraphicsCache } from './util/GraphicsCache';

export type WallMaterial = 'granite' | 'limestone' | 'clay' | 'dirt';
export type ExcavatedMaterial = 'dirt' | 'wood' | 'pebbles' | 'stones' | 'concrete';

const graphicsCacheByTerrain = new Map<TerrainDefinition, GraphicsCache>();

function getGraphicsCache(terrain: TerrainDefinition): null | GraphicsCache {
	let cache = graphicsCacheByTerrain.get(terrain);
	if (cache) {
		return cache;
	}
	if (terrain === DeepWaterTerrain) {
		graphicsCacheByTerrain.set(terrain, new GraphicsCache(() => createWaveGraphic('#227EE7')));
	} else if (terrain === ShallowWaterTerrain) {
		graphicsCacheByTerrain.set(terrain, new GraphicsCache(() => createWaveGraphic('#50ACF6')));
	} else if (terrain === SandTerrain) {
		graphicsCacheByTerrain.set(terrain, new GraphicsCache(() => createSandGraphic('#F4E4BC')));
	} else if (terrain === GrassTerrain) {
		// graphicsCacheByTerrain.set(terrain, new GraphicsCache(() => createGrassGraphic('#7CB342')));
		return null;
	}
	return graphicsCacheByTerrain.get(terrain) ?? null;
}

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

	const [graphicsUrl, setGraphicsUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!surfaceType) {
			return;
		}
		const cache = getGraphicsCache(surfaceType);
		if (!cache) {
			return;
		}
		cache.get().then((url) => {
			//
			setGraphicsUrl((prev) => prev ?? url);
			// setGraphicsUrl(url);
		});
	}, [surfaceType]);

	if (surfaceType === MysteriousTerrain) {
		return null;
	}
	return (
		<MapLocation eventedQualifiedCoordinates={tile.location} dx={1} dy={1} style={style}>
			{graphicsUrl && <img src={graphicsUrl} />}
		</MapLocation>
	);
};
