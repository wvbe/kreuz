import { EcsEntity } from '../../level-1/ecs/types';
import { Material } from '../../lib/level-1/inventory/Material';
import { MaterialState } from '../../lib/level-1/inventory/types';

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
		createEntity: (self: Constructible) => EcsEntity;
	};
};
