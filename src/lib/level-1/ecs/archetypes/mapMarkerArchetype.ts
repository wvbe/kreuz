import { SimpleCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { locationComponent } from '../components/locationComponent';
import { visibilityComponent } from '../components/visibilityComponent';

export const mapMarkerArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		name: string;
		icon: string | React.ReactNode;
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
