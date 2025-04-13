import { token } from '../../utilities/ReplacementSpace';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component have a name and icon that makes them visible to the player on a map, UI, etc.
 */
export const visibilityComponent = new EcsComponent<{
	/**
	 * The name of the entity.
	 */
	name: string;
	/**
	 * The icon of the entity. Often an emoji.
	 */
	icon: string;
}>(
	(entity) => entity.name !== undefined && entity.icon !== undefined,
	(entity, options) => {
		Object.assign(entity, options, {
			toString() {
				return token('entity', entity);
			},
		});
	},
);
