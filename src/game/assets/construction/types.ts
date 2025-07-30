import { EcsEntity } from '../../core/ecs/types';
import { Material } from '../../core/inventory/Material';
import { MaterialState } from '../../core/inventory/types';
import { QualifiedCoordinate } from '../../core/terrain/types';
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
		createEntity?: (self: Constructible, location: QualifiedCoordinate) => EcsEntity;
	};
};
