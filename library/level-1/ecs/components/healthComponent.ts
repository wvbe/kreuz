import { EcsComponent } from '../classes/EcsComponent.ts';
import { ProgressingNumericValue } from '../../events/ProgressingNumericValue.ts';
import { EcsEntity } from '../types.ts';
import { Event } from '../../events/Event.ts';

export const healthComponent = new EcsComponent<
	{ health: number },
	{ $health: ProgressingNumericValue; $death: Event }
>(
	(entity) => entity.$health instanceof ProgressingNumericValue && entity.$death instanceof Event,
	(entity, options) => {
		Object.assign(entity, {
			$health: new ProgressingNumericValue(
				options.health,
				{ delta: 0, granularity: 0.01, min: 0, max: 1 },
				'healthComponent $health',
			),
			$death: new Event('healthComponent $death'),
		});
	},
);
