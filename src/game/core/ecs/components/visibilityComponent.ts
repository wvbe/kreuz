import { token } from '../../../../ui/contexts/ReplacementSpace';
import { EcsComponent } from '../classes/EcsComponent';

/**
 * Entities with this component have a name and icon that makes them visible to the player on a map, UI, etc.
 */
export const visibilityComponent = new EcsComponent<
	{
		/**
		 * The name of the entity.
		 */
		name: string;
		/**
		 * The icon of the entity. Often an emoji, could be a React element.
		 */
		icon: string | React.ReactNode;

		/**
		 * The size modifier of this icon. Probably a bad practice to have here, but gotta get shit done.
		 */
		iconSize?: number;

		visiblityPriority?: number;
	},
	{
		/**
		 * The name of the entity.
		 */
		name: string;
		/**
		 * The icon of the entity. Often an emoji, could be a React element.
		 */
		icon: string | React.ReactNode;

		/**
		 * The size modifier of this icon. Probably a bad practice to have here, but gotta get shit done.
		 */
		iconSize?: number;

		visiblityPriority: number;
	}
>(
	(entity) => entity.name !== undefined && entity.icon !== undefined,
	(entity, options) => {
		Object.assign(entity, options, {
			visiblityPriority: options.visiblityPriority ?? 500,
			toString() {
				return token('entity', entity);
			},
		});
	},
);
