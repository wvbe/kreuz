import { PERSON_NEEDS, PersonNeedId } from '../../constants/needs';
import { Need } from '../../entities/Need';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component have needs that must be satisfied, or that can drive choices further
 * down the road.
 */
export const needsComponent = new EcsComponent<
	Record<PersonNeedId, number>,
	{
		/**
		 * The needs of the entity.
		 */
		needs: Record<PersonNeedId, Need>;
	}
>(
	(entity) => !!entity.needs,
	(entity, options) => {
		Object.assign(entity, {
			needs: PERSON_NEEDS.reduce<Record<string, Need>>(
				(map, needConfig) => ({
					...map,
					[needConfig.id]: new Need(
						needConfig.id,
						options[needConfig.id],
						needConfig.label,
						needConfig.decay,
					),
				}),
				{},
			),
		});
	},
);
