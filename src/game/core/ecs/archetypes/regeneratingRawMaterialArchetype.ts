import { timberMaterial } from '../../../assets/materials/rawMaterials';
import { grassMaterial } from '../../../assets/materials/vegetation';
import { QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { eventLogComponent } from '../components/eventLogComponent';
import { locationComponent } from '../components/locationComponent';
import { rawMaterialComponent } from '../components/rawMaterialComponent';
import { visibilityComponent } from '../components/visibilityComponent';

export enum RawMaterialType {
	PINEWOOD,
	GRASS,
}

export const regeneratingRawMaterialArchetype = new EcsArchetype<
	{
		location: QualifiedCoordinate;
		type: RawMaterialType;
	},
	typeof locationComponent | typeof visibilityComponent | typeof eventLogComponent
>([locationComponent, visibilityComponent, eventLogComponent], (entity, options) => {
	locationComponent.attach(entity, {
		location: options.location,
	});
	eventLogComponent.attach(entity, {});
	switch (options.type) {
		case RawMaterialType.PINEWOOD: {
			rawMaterialComponent.attach(entity, {
				rawMaterials: [
					{
						material: timberMaterial,
						totalCapacity: 100,
						quantity: 0,
					},
				],
			});
			visibilityComponent.attach(entity, {
				name: timberMaterial.label,
				icon: timberMaterial.symbol,
				iconSize: 0.7,
			});
			break;
		}
		case RawMaterialType.GRASS: {
			rawMaterialComponent.attach(entity, {
				rawMaterials: [
					{
						material: grassMaterial,
						totalCapacity: 100,
						quantity: 0,
					},
				],
			});
			visibilityComponent.attach(entity, {
				name: grassMaterial.label,
				icon: grassMaterial.symbol,
				iconSize: 0.7,
			});
			break;
		}
	}
});
