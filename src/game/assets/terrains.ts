export type TerrainDefinition = {
	icon: string;
	label: string;
	walkability: number;
	isBuildable: boolean;
	baseColor: string;
};
export const MysteriousTerrain: TerrainDefinition = {
	icon: '🌫️',
	label: 'Unknown terrain',
	walkability: 1,
	isBuildable: false,
	baseColor: '#000000',
};
export const OpenTerrain: TerrainDefinition = {
	icon: '🌏',
	label: 'Open',
	walkability: 1,
	isBuildable: true,
	baseColor: '#000000',
};

/**
 * Sandy terrain - typically found on beaches and desert areas.
 * Entities can walk on sand but movement might be slightly slower than grass.
 */
export const SandTerrain: TerrainDefinition = {
	icon: '🏖️',
	label: 'Sand',
	walkability: 0.8,
	isBuildable: true,
	baseColor: '#F4E4BC',
};

/**
 * Grassy terrain - the most common walkable surface type.
 * Provides optimal movement speed for entities.
 */
export const GrassTerrain: TerrainDefinition = {
	icon: '🌿',
	label: 'Grass',
	walkability: 1,
	isBuildable: true,
	baseColor: '#7CB342',
};

/**
 * Shallow water - entities cannot walk here but boats/swimming might be possible.
 * Can potentially be filled or drained for construction.
 */
export const ShallowWaterTerrain: TerrainDefinition = {
	icon: '💦',
	label: 'Shallow Water',
	walkability: 0,
	isBuildable: false,
	baseColor: '#2196F3',
};

/**
 * Deep water - completely impassable for most entities.
 * Represents deep ocean, lakes, or rivers.
 */
export const DeepWaterTerrain: TerrainDefinition = {
	icon: '🌊',
	label: 'Deep Water',
	walkability: 0,
	isBuildable: false,
	baseColor: '#1565C0',
};
