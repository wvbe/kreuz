import { useEffect, useState } from 'react';
import {
	DeepWaterTerrain,
	GrassTerrain,
	SandTerrain,
	ShallowWaterTerrain,
	TerrainDefinition,
} from '../../game/assets/terrains';
import { GraphicsCache } from '../game/util/GraphicsCache';
import { createSandGraphic } from './createSandGraphic';
import { createWaveGraphic } from './createWaveGraphic';

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

export function usePregeneratedCanvasImage(surfaceType?: TerrainDefinition | null) {
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

	return graphicsUrl;
}
