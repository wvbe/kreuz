import { PERSON_NEEDS, PersonNeedId } from '../../constants/needs.ts';
import { Need } from '../../entities/Need.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const needsComponent = new EcsComponent<
	Record<PersonNeedId, number>,
	{
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
