import { QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { locationComponent } from '../components/locationComponent';
import { visibilityComponent } from '../components/visibilityComponent';

/**
 * The `mapMarkerArchetype` is an ECS archetype that defines entities representing map markers.
 * These entities have a location and are visible on the map with a name and an icon.
 *
 * Components:
 * - `locationComponent`: Provides the spatial location of the entity on the map.
 * - `visibilityComponent`: Provides the visual representation of the entity, including its name and icon.
 *
 * Options:
 * - `location`: The coordinate on the map where the entity is located.
 * - `name`: The name of the entity, used for display purposes.
 * - `icon`: The icon representing the entity, which can be a string or a React node.
 */
export const mapMarkerArchetype = new EcsArchetype<
	{
		location: QualifiedCoordinate;
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
