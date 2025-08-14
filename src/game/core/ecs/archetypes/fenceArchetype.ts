import { Collection } from '../../events/Collection';
import { Terrain } from '../../terrain/Terrain';
import { SimpleCoordinate, type QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { outlineComponent } from '../components/outlineComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { EcsArchetypeEntity } from '../types';
import { tileArchetype } from './tileArchetype';

export const fenceArchetype = new EcsArchetype<
	{
		coordinates: QualifiedCoordinate[];
	},
	typeof visibilityComponent | typeof outlineComponent
>([visibilityComponent, outlineComponent], (entity, options) => {
	const outlineCoordinatesCollection = new Collection<SimpleCoordinate>();

	const terrain = options.coordinates[0][0];
	if (!terrain || !(terrain instanceof Terrain)) {
		throw new Error('A fence must have at least one coordinate');
	}

	outlineCoordinatesCollection.add(
		...options.coordinates.map((qualified) => {
			if (qualified[0] !== terrain) {
				throw new Error('A fence can only consist of tiles on the same terrain');
			}
			return qualified.slice(1) as SimpleCoordinate;
		}),
	);

	outlineComponent.attach(entity, {
		outlineCoordinates: outlineCoordinatesCollection.slice(),
	});
});

export type Tile = EcsArchetypeEntity<typeof tileArchetype>;
