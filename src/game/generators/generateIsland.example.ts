/**
 * Example usage of the island generation function.
 *
 * This file demonstrates how to generate an island and integrate it with the game's terrain system.
 */

import Game from '../core/Game';
import { Terrain } from '../core/terrain/Terrain';
import { generateIsland, getIslandTileInfos, IslandTerrainType } from './generateIsland';

/**
 * Example: Generate a small island and add it to a terrain
 */
export async function createSmallIsland(game: Game): Promise<void> {
	// Generate a 30x30 island at sea level (Z=0)
	const islandTiles = generateIsland({
		width: 30,
		height: 30,
		waterlineZ: 0,
		seed: 12345,
		centerX: 15,
		centerY: 15,
	});

	// Convert to tile infos for terrain creation
	const tileInfos = getIslandTileInfos(islandTiles);

	// Add tiles to the game's main terrain
	await game.terrain.addTiles(tileInfos);

	console.log(`Generated island with ${tileInfos.length} tiles`);

	// Log terrain type distribution
	const terrainCounts = islandTiles.reduce((counts, tile) => {
		counts[tile.terrainType] = (counts[tile.terrainType] || 0) + 1;
		return counts;
	}, {} as Record<IslandTerrainType, number>);

	console.log('Terrain distribution:', terrainCounts);
}

/**
 * Example: Generate a larger archipelago with multiple islands
 */
export async function createArchipelago(game: Game): Promise<void> {
	const islands = [
		{ centerX: 20, centerY: 20, width: 25, height: 25, seed: 100 },
		{ centerX: 60, centerY: 30, width: 20, height: 20, seed: 200 },
		{ centerX: 40, centerY: 70, width: 30, height: 25, seed: 300 },
		{ centerX: 80, centerY: 80, width: 15, height: 15, seed: 400 },
	];

	const allTileInfos = [];

	for (const island of islands) {
		const islandTiles = generateIsland({
			...island,
			waterlineZ: 0,
		});

		allTileInfos.push(...getIslandTileInfos(islandTiles));
	}

	// Add all island tiles to the terrain
	await game.terrain.addTiles(allTileInfos);

	console.log(
		`Generated archipelago with ${allTileInfos.length} total tiles across ${islands.length} islands`,
	);
}

/**
 * Example: Generate an island at a specific elevation level
 */
export async function createMountainousIsland(game: Game): Promise<void> {
	// Generate an island at elevation 10 (floating island or mountain plateau)
	const islandTiles = generateIsland({
		width: 40,
		height: 40,
		waterlineZ: 10, // Higher elevation
		seed: 54321,
		centerX: 20,
		centerY: 20,
	});

	const tileInfos = getIslandTileInfos(islandTiles);
	await game.terrain.addTiles(tileInfos);

	console.log(`Generated mountainous island at elevation 10 with ${tileInfos.length} tiles`);
}

/**
 * Example: Create a custom terrain just for an island
 */
export async function createIslandTerrain(
	parentTerrain: Terrain,
	portalLocation: [number, number, number],
): Promise<Terrain> {
	// Create a separate terrain for the island
	const islandTerrain = new Terrain({
		id: 'island-terrain',
		parentage: {
			parentTerrain: parentTerrain,
			portalStart: portalLocation,
			portalEnd: [25, 25, 0], // Center of the island
		},
	});

	// Generate the island in its own terrain space
	const islandTiles = generateIsland({
		width: 50,
		height: 50,
		waterlineZ: 0,
		seed: Math.floor(Math.random() * 10000),
	});

	const tileInfos = getIslandTileInfos(islandTiles);
	await islandTerrain.addTiles(tileInfos);

	return islandTerrain;
}

/**
 * Example: Generate an island with custom parameters for different biomes
 */
export async function createCustomBiomeIsland(
	game: Game,
	biomeType: 'tropical' | 'arctic' | 'volcanic',
): Promise<void> {
	let seed: number;
	let size: number;

	// Customize generation based on biome
	switch (biomeType) {
		case 'tropical':
			seed = 77777;
			size = 35; // Larger tropical island
			break;
		case 'arctic':
			seed = 88888;
			size = 25; // Medium arctic island
			break;
		case 'volcanic':
			seed = 99999;
			size = 20; // Smaller, more dramatic volcanic island
			break;
	}

	const islandTiles = generateIsland({
		width: size,
		height: size,
		waterlineZ: 0,
		seed: seed,
		centerX: size / 2,
		centerY: size / 2,
	});

	const tileInfos = getIslandTileInfos(islandTiles);
	await game.terrain.addTiles(tileInfos);

	console.log(`Generated ${biomeType} island with ${tileInfos.length} tiles`);
}
