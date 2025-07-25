import { type SimpleCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { locationComponent } from '../components/locationComponent';
import { mineralContentsComponent } from '../components/mineralContentsComponent';
import { outlineComponent } from '../components/outlineComponent';
import { pathableComponent } from '../components/pathableComponent';
import { surfaceComponent, SurfaceType } from '../components/surfaceComponent';
import { visibilityComponent } from '../components/visibilityComponent';

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
	| typeof mineralContentsComponent
>(
	[
		visibilityComponent,
		locationComponent,
		outlineComponent,
		surfaceComponent,
		pathableComponent,
		mineralContentsComponent,
	],
	(entity, options) => {
		locationComponent.attach(entity, {
			location: options.location,
		});
		outlineComponent.attach(entity, {
			outlineCoordinates: options.outlineCoordinates,
		});
		surfaceComponent.attach(entity, { surfaceType: options.surfaceType });
		mineralContentsComponent.attach(entity, {
			location: options.location,
		});
		pathableComponent.attach(entity, {
			walkability: options.surfaceType === SurfaceType.OPEN ? 1 : 0,
		});
		visibilityComponent.attach(entity, {
			icon: '🌏',
			name: options.surfaceType === SurfaceType.OPEN ? 'Walkable terrain' : 'Unknown terrain',
		});
	},
);
