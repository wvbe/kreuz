import { TerrainDefinition } from '../../../assets/terrains';
import { Terrain } from '../../terrain/Terrain';
import { QualifiedCoordinate, SimpleCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { eventLogComponent } from '../components/eventLogComponent';
import { locationComponent } from '../components/locationComponent';
import { portalComponent } from '../components/portalComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { EcsEntity } from '../types';

/**
 * Some common options for the portal archetype.
 *
 * - `name`: The name of the portal.
 *
 * And then two mutually exclusive option groups:
 * - The options to self-register a new {@link Terrain} and a portal entity to it
 * - Or you're setting up the portal entity back to the paren
 * - `reverseOfPortalEntity`: If set, this portal is the reverse of another portal.
 * - `location`: The location of the portal.
 * - `tiles`: The tiles of the portal.
 * - `portalEnd`: The end of the portal.
 */
type PortalArchetypeOptions = {
	name: string;
} & (
	| {
			location: QualifiedCoordinate;
			tiles: {
				location: SimpleCoordinate;
				surfaceType: TerrainDefinition;
			}[];
			portalEnd: SimpleCoordinate;
			reverseOfPortalEntity?: null;
	  }
	| {
			location?: null;
			tiles?: null;
			portalEnd?: null;
			reverseOfPortalEntity: EcsEntity<
				typeof locationComponent | typeof visibilityComponent | typeof portalComponent
			>;
	  }
);

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
export const portalArchetype = new EcsArchetype<
	PortalArchetypeOptions,
	| typeof locationComponent
	| typeof visibilityComponent
	| typeof portalComponent
	| typeof eventLogComponent
>(
	[locationComponent, visibilityComponent, portalComponent, eventLogComponent],
	(entity, options) => {
		visibilityComponent.attach(entity, {
			name: options.name,
			icon: options.reverseOfPortalEntity ? `🚪` : `🏠`,
			iconSize: 0.9,
		});

		if (options.reverseOfPortalEntity) {
			const [destinationTerrain] = options.reverseOfPortalEntity.location.get();
			const ownTerrain = options.reverseOfPortalEntity.portalDestinationTerrain;
			const ownCoordinate = ownTerrain.getLocationOfPortalToTerrain(destinationTerrain);
			portalComponent.attach(entity, {
				portalDestinationTerrain: destinationTerrain,
			});
			locationComponent.attach(entity, {
				location: [ownTerrain, ...ownCoordinate],
			});
		} else {
			const [ownTerrain, ...ownCoordinate] = options.location;

			portalComponent.attach(entity, {
				portalDestinationTerrain: new Terrain({
					id: entity.id,
					parentage: {
						portalStart: ownCoordinate,
						parentTerrain: ownTerrain,
						portalEnd: options.portalEnd,
					},
					tiles: options.tiles,
				}),
			});

			eventLogComponent.attach(entity, {});
			locationComponent.attach(entity, {
				location: options.location,
			});
		}
	},
);
