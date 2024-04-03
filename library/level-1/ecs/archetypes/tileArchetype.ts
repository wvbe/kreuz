import { type SimpleCoordinate } from '../../terrain/types.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { outlineComponent } from '../components/outlineComponent.ts';
import { pathableComponent } from '../components/pathableComponent.ts';
import { surfaceComponent, SurfaceType } from '../components/surfaceComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';

export const tileArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		outlineCoordinates: SimpleCoordinate[];
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
		outlineComponent.attach(entity, { outlineCoordinates: options.outlineCoordinates });
		surfaceComponent.attach(entity, { surfaceType: options.surfaceType });
		pathableComponent.attach(entity, {
			walkability: options.surfaceType === SurfaceType.OPEN ? 1 : 0,
		});
		visibilityComponent.attach(entity, {
			icon: '🌏',
			name: options.surfaceType === SurfaceType.OPEN ? 'Walkable terrain' : 'Unknown terrain',
		});
	},
);
