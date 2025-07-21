import { WallMaterial, ExcavatedMaterial } from '../../../../../ui2/game/GameMapTile';

/**
 * Represents the material composition of a terrain tile.
 * Each tile has two material distributions:
 * - wall: The materials that make up the unexcavated wall (granite, limestone, clay, dirt)
 * - excavated: The materials that appear when the tile is excavated (dirt, wood, pebbles, stones, concrete)
 *
 * The numbers in each Record represent the proportion/weight of that material,
 * where all weights in a distribution sum to 1.0. These weights are used to
 * blend the material colors when rendering the terrain.
 */
export type MaterialDistribution = {
	wall: Record<WallMaterial, number>;
	excavated: Record<ExcavatedMaterial, number>;
};

// Helper function to generate deterministic noise
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

// Helper function to generate octave noise
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

// Material seeds for deterministic generation
const MATERIAL_SEEDS = {
	wall: {
		granite: 12345,
		limestone: 23456,
		clay: 34567,
		dirt: 45678,
	},
	excavated: {
		dirt: 56789,
		wood: 67890,
		pebbles: 78901,
		stones: 89012,
		concrete: 90123,
	},
};

function getMaterialDistributionForMaterials<Material extends string>(
	materials: { material: Material; seed: number }[],
	scaleFactor: number,
	x: number,
	y: number,
): Record<Material, number> {
	// Generate noise values for each material
	const noises = materials.map(({ material, seed }) => ({
		material,
		value: octaveNoise(x * scaleFactor, y * scaleFactor, 4, 0.5, seed),
	}));

	// Normalize values
	const total = noises.reduce((sum, { value }) => sum + value, 0);

	return noises.reduce((acc, { material, value }) => {
		acc[material] = value / total;
		return acc;
	}, {} as Record<Material, number>);
}

// Scale factors for material distribution
const SCALE_FACTORS = {
	wall: 0.2, // Larger scale for wall materials
	excavated: 0.3, // Slightly smaller scale for excavated materials
};

/**
 * Generates a deterministic material distribution for a given x,y coordinate.
 *
 * The distribution contains two categories of materials:
 * 1. Wall materials (granite, limestone, clay, dirt)
 * 2. Excavated materials (dirt, wood, pebbles, stones, concrete)
 *
 * For each category, it:
 * 1. Generates noise values using octave noise with different seeds for each material
 * 2. Normalizes the values so they sum to 1.0
 *
 * The distribution is:
 * - Deterministic (same coordinates always give same distribution)
 * - Continuous (nearby coordinates give similar distributions)
 * - Normalized (probabilities in each category sum to 1.0)
 *
 * @param x - The x coordinate to generate distribution for
 * @param y - The y coordinate to generate distribution for
 * @returns MaterialDistribution object containing normalized probabilities for each material type
 */
export function getMaterialDistribution(x: number, y: number): MaterialDistribution {
	const distribution: MaterialDistribution = {
		wall: getMaterialDistributionForMaterials(
			Object.entries(MATERIAL_SEEDS.wall).map(([material, seed]) => ({
				material: material as WallMaterial,
				seed,
			})),
			SCALE_FACTORS.wall,
			x,
			y,
		),
		excavated: getMaterialDistributionForMaterials(
			Object.entries(MATERIAL_SEEDS.excavated).map(([material, seed]) => ({
				material: material as ExcavatedMaterial,
				seed,
			})),
			SCALE_FACTORS.excavated,
			x,
			y,
		),
	};

	return distribution;
}
