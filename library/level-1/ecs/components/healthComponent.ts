import { EcsComponent } from '../classes/EcsComponent.ts';
import { ProgressingNumericValue } from '../../events/ProgressingNumericValue.ts';
import { EcsEntity } from '../types.ts';

export const healthComponent = new EcsComponent<
	{ health: number },
	{ $health: ProgressingNumericValue }
>(
	(entity) => entity.$health instanceof ProgressingNumericValue,
	(entity, options) => {
		Object.assign(entity, {
			$health: new ProgressingNumericValue(
				options.health,
				{ delta: 0, granularity: 0.01, min: 0, max: 1 },
				'healthComponent $health',
			),
		});
	},
);
