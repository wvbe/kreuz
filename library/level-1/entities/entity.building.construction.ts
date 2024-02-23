import { Blueprint } from '../inventory/Blueprint.ts';
import { MaterialState } from '../inventory/types.ts';
import { type SimpleCoordinate } from '../types.ts';
import { FactoryBuildingEntity, FactoryBuildingEntityOptions } from './entity.building.factory.ts';
import { PersonEntity } from './entity.person.ts';
import { type EntityI } from './types.ts';

export type ConstructionSiteEntityOptions = FactoryBuildingEntityOptions & {
	/**
	 * The amount of time needed for this construction
	 */
	constructionFte: number;

	/**
	 * The materials needed for this construction
	 */
	constructionMaterials: MaterialState[];
};

export class ConstructionSiteEntity extends FactoryBuildingEntity implements EntityI {
	public readonly type = 'construction-site';

	public get name() {
		return 'Construction site';
	}

	public get icon() {
		return '🚧';
	}

	public constructor(
		id: string,
		location: SimpleCoordinate,
		owner: PersonEntity,
		options: ConstructionSiteEntityOptions,
	) {
		super(id, location, owner, {
			...options,
			blueprint: new Blueprint('Building a thing', options.constructionMaterials, [], {
				workersRequired: 1,
				fullTimeEquivalent: options.constructionFte,
			}),
		});
	}
}
