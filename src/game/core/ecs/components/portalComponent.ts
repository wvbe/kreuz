import { Terrain } from '../../terrain/Terrain';
import { EcsComponent } from '../classes/EcsComponent';

export const portalComponent = new EcsComponent<{
	portalDestinationTerrain: Terrain;
}>((entity) => entity.portalDestinationTerrain instanceof Terrain);
