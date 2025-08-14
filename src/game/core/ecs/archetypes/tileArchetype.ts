import { TerrainDefinition } from '../../../assets/terrains';
import { SimpleCoordinate, type QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { locationComponent } from '../components/locationComponent';
import { outlineComponent } from '../components/outlineComponent';
import { pathableComponent } from '../components/pathableComponent';
import { surfaceComponent } from '../components/surfaceComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { EcsArchetypeEntity } from '../types';

export const tileArchetype = new EcsArchetype<
	{
		location: QualifiedCoordinate;
		outlineCoordinates?: SimpleCoordinate[];
		surfaceType: TerrainDefinition;
	},
	| typeof visibilityComponent
	| typeof locationComponent
	| typeof outlineComponent
	| typeof surfaceComponent
	| typeof pathableComponent
>(
	[visibilityComponent, locationComponent, outlineComponent, surfaceComponent, pathableComponent],
	(entity, options) => {
		locationComponent.attach(entity, {
			location: options.location,
		});
		outlineComponent.attach(entity, {
			outlineCoordinates: options.outlineCoordinates ?? [
				[-0.5, -0.5, 0],
				[0.5, -0.5, 0],
				[0.5, 0.5, 0],
				[-0.5, 0.5, 0],
			],
		});
		surfaceComponent.attach(entity, { surfaceType: options.surfaceType });
		pathableComponent.attach(entity, {
			walkability: options.surfaceType.walkability,
		});
		visibilityComponent.attach(entity, {
			icon: options.surfaceType.icon,
			name: options.surfaceType.label,
		});
	},
);

export type Tile = EcsArchetypeEntity<typeof tileArchetype>;
