import { EcsEntity } from '../../level-1/ecs/types';
import { Material } from '../../level-1/inventory/Material';
import { MaterialState } from '../../level-1/inventory/types';
import { SimpleCoordinate } from '../../level-1/terrain/types';
export type RawMaterial = Material & {
	type: 'raw';
	description: string;
};

export type ProcessedMaterial = Material & {
	type: 'processed';
	construction?: {
		time: number;
		requiredMaterials: MaterialState<RawMaterial | ProcessedMaterial>[];
	};
};

export type Constructible = Material & {
	type: 'fixture' | 'furniture';
	construction: {
		time: number;
		requiredMaterials: MaterialState<RawMaterial | ProcessedMaterial>[];
		createEntity?: (self: Constructible, location: SimpleCoordinate) => EcsEntity;
	};
};
