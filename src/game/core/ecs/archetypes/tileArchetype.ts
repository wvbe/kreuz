import { SimpleCoordinate, type QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { locationComponent } from '../components/locationComponent';
import { outlineComponent } from '../components/outlineComponent';
import { pathableComponent } from '../components/pathableComponent';
import { surfaceComponent, SurfaceType } from '../components/surfaceComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { EcsArchetypeEntity } from '../types';

export const tileArchetype = new EcsArchetype<
	{
		location: QualifiedCoordinate;
		outlineCoordinates?: SimpleCoordinate[];
		surfaceType: SurfaceType;
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
			walkability: options.surfaceType === SurfaceType.OPEN ? 1 : 0,
		});
		visibilityComponent.attach(entity, {
			icon: options.surfaceType === SurfaceType.OPEN ? '🌏' : '🌫️',
			name: options.surfaceType === SurfaceType.OPEN ? 'Walkable terrain' : 'Unknown terrain',
		});
	},
);

export type Tile = EcsArchetypeEntity<typeof tileArchetype>;
