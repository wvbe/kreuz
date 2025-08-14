import {
	DeepWaterTerrain,
	GrassTerrain,
	MysteriousTerrain,
	SandTerrain,
	ShallowWaterTerrain,
	TerrainDefinition,
} from '../assets/terrains';
import { SimpleCoordinate } from '../core/terrain/types';

/**
 * Parameters for island generation
 */
export interface IslandGenerationOptions {
	/** Width of the island area in tiles */
	width: number;
	/** Height of the island area in tiles */
	height: number;
	/** Z-level at which the waterline sits */
	waterlineZ: number;
	/** Seed for deterministic generation */
	seed?: number;
	/** Center X coordinate for the island */
	centerX?: number;
	/** Center Y coordinate for the island */
	centerY?: number;
}

/**
 * Island terrain types mapped to surface types
 */
export enum IslandTerrainType {
	DEEP_WATER = 'DEEP_WATER',
	SHALLOW_WATER = 'SHALLOW_WATER',
	BEACH = 'BEACH',
	GRASS = 'GRASS',
}

/**
 * Represents a generated tile with its terrain type and position
 */
export interface GeneratedIslandTile {
	location: SimpleCoordinate;
	surfaceType: TerrainDefinition;
	terrainType: IslandTerrainType;
	/** Elevation value used for generation (0-1) */
	elevation: number;
}

/**
 * Helper function to generate deterministic noise using a simple hash-based algorithm
 */
function noise2D(x: number, y: number, seed: number): number {
	const X = Math.floor(x) & 255;
	const Y = Math.floor(y) & 255;
	const xf = x - Math.floor(x);
	const yf = y - Math.floor(y);

	// Hash function
	const hash = (n: number) => {
		let h = (n + seed) * 2654435761;
		h ^= h >> 16;
		h *= 2654435761;
		h ^= h >> 16;
		return h / 4294967296;
	};

	const topRight = hash(X + 1 + (Y + 1) * 256);
	const topLeft = hash(X + Y * 256);
	const bottomRight = hash(X + 1 + Y * 256);
	const bottomLeft = hash(X + (Y + 1) * 256);

	// Bilinear interpolation
	const top = topLeft + (topRight - topLeft) * xf;
	const bottom = bottomLeft + (bottomRight - bottomLeft) * xf;
	return top + (bottom - top) * yf;
}

/**
 * Helper function to generate octave noise for more natural terrain features
 */
function octaveNoise(
	x: number,
	y: number,
	octaves: number,
	persistence: number,
	seed: number,
): number {
	let total = 0;
	let frequency = 1;
	let amplitude = 1;
	let maxValue = 0;

	for (let i = 0; i < octaves; i++) {
		total += noise2D(x * frequency, y * frequency, seed + i) * amplitude;
		maxValue += amplitude;
		amplitude *= persistence;
		frequency *= 2;
	}

	return total / maxValue;
}

/**
 * Calculates distance from center normalized to 0-1 range
 */
function getDistanceFromCenter(
	x: number,
	y: number,
	centerX: number,
	centerY: number,
	width: number,
	height: number,
): number {
	const dx = (x - centerX) / (width * 0.5);
	const dy = (y - centerY) / (height * 0.5);
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Determines terrain type based on elevation and distance from center
 */
function getTerrainType(elevation: number, distanceFromCenter: number): IslandTerrainType {
	// Create island falloff - areas far from center become water
	// Use a softer falloff to ensure more land in the center
	const islandFactor = Math.max(0, 1 - distanceFromCenter * 0.6);
	const adjustedElevation = elevation * islandFactor;

	// More lenient thresholds to create more land
	if (adjustedElevation < 0.15) {
		return IslandTerrainType.DEEP_WATER;
	} else if (adjustedElevation < 0.17) {
		return IslandTerrainType.SHALLOW_WATER;
	} else if (adjustedElevation < 0.19) {
		return IslandTerrainType.BEACH;
	} else {
		return IslandTerrainType.GRASS;
	}
}

/**
 * Maps island terrain types to ECS surface types
 */
function getSurfaceType(terrainType: IslandTerrainType): TerrainDefinition {
	switch (terrainType) {
		case IslandTerrainType.DEEP_WATER:
			return DeepWaterTerrain;
		case IslandTerrainType.SHALLOW_WATER:
			return ShallowWaterTerrain;
		case IslandTerrainType.BEACH:
			return SandTerrain;
		case IslandTerrainType.GRASS:
			return GrassTerrain;
		default:
			return MysteriousTerrain;
	}
}

/**
 * Generates an island using noise algorithms for natural-looking terrain.
 *
 * Creates a procedurally generated island with deep water, shallow water, beach, and grass areas.
 * Uses octave noise for realistic terrain generation with smooth transitions between terrain types.
 *
 * The island generation uses the following algorithm:
 * 1. Generate base elevation using octave noise
 * 2. Apply distance-based falloff to create island shape
 * 3. Classify terrain types based on adjusted elevation
 * 4. Map terrain types to ECS surface types
 *
 * @param options - Configuration options for island generation
 * @returns Array of generated tiles with their positions, surface types, and terrain information
 *
 * @example
 * ```typescript
 * const islandTiles = generateIsland({
 *   width: 50,
 *   height: 50,
 *   waterlineZ: 0,
 *   seed: 12345
 * });
 *
 * // Add tiles to terrain
 * const tileInfos = islandTiles.map(tile => ({
 *   location: tile.location,
 *   surfaceType: tile.surfaceType
 * }));
 * await terrain.addTiles(tileInfos);
 * ```
 */
export function generateIsland(options: IslandGenerationOptions): GeneratedIslandTile[] {
	const {
		width,
		height,
		waterlineZ,
		seed = Math.floor(Math.random() * 10000),
		centerX = width / 2,
		centerY = height / 2,
	} = options;

	const tiles: GeneratedIslandTile[] = [];

	// Generate noise-based terrain
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			// Generate base elevation using multiple octaves for realistic terrain
			const baseElevation = octaveNoise(
				x * 0.05, // Scale factor for noise frequency
				y * 0.05,
				4, // Number of octaves for detail
				0.5, // Persistence for amplitude decay
				seed,
			);

			// Add some variation with a second noise layer
			const detailNoise = octaveNoise(x * 0.15, y * 0.15, 2, 0.3, seed + 1000);

			// Combine base elevation with detail noise
			const elevation = Math.max(0, Math.min(1, baseElevation + detailNoise * 0.3));

			// Calculate distance from center for island shaping
			const distanceFromCenter = getDistanceFromCenter(x, y, centerX, centerY, width, height);

			// Determine terrain type based on elevation and distance
			const terrainType = getTerrainType(elevation, distanceFromCenter);
			const surfaceType = getSurfaceType(terrainType);

			tiles.push({
				location: [x, y, waterlineZ],
				surfaceType,
				terrainType,
				elevation,
			});
		}
	}

	return tiles;
}

/**
 * Utility function to get only the tile information needed for terrain creation
 */
export function getIslandTileInfos(islandTiles: GeneratedIslandTile[]): Array<{
	location: SimpleCoordinate;
	surfaceType: TerrainDefinition;
}> {
	console.log(islandTiles.map((tile) => tile.elevation).join('\t'));
	return islandTiles.map((tile) => ({
		location: tile.location,
		surfaceType: tile.surfaceType,
	}));
}
