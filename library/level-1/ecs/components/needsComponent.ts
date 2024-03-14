import { PERSON_NEEDS } from '../../constants/needs.ts';
import { Need } from '../../entities/Need.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const needsComponent = new EcsComponent<
	{
		nutrition: number;
		hydration: number;
		energy: number;
		hygiene: number;
		ideology: number;
	},
	{
		needs: {
			nutrition: Need;
			hydration: Need;
			energy: Need;
			hygiene: Need;
			religion: Need;
		};
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
