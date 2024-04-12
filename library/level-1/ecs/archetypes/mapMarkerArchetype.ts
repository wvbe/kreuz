import { SimpleCoordinate } from '../../terrain/types.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';

export const mapMarkerArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		name: string;
		icon: string;
	},
	typeof locationComponent | typeof visibilityComponent
>([locationComponent, visibilityComponent], (entity, options) => {
	locationComponent.attach(entity, {
		location: options.location,
	});
	visibilityComponent.attach(entity, {
		name: options.name,
		icon: options.icon,
	});
});
