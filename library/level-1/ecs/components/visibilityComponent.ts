import { token } from '../../utilities/ReplacementSpace.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const visibilityComponent = new EcsComponent<{ name: string; icon: string }>(
	(entity) => entity.name !== undefined && entity.icon !== undefined,
	(entity, options) => {
		Object.assign(entity, options, {
			toString() {
				return token('entity', entity);
			},
		});
	},
);
