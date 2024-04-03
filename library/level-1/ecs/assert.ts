import { EcsComponent } from './classes/EcsComponent.ts';
import { EcsEntity } from './types.ts';

/**
 * Returns true if the entity has all of the required components.
 */
export function hasEcsComponents<G extends EcsComponent<any, any>>(
	entity: EcsEntity,
	components: G[],
): entity is EcsEntity<G> {
	for (const component of components) {
		if (!component.test(entity)) {
			return false;
		}
	}
	return true;
}

/**
 * A function that creates an filter function, filtering away anything that does not have all of
 * the required components.
 */
export function byEcsComponents<G extends EcsComponent<any, any>>(
	components: G[],
): (entity: EcsEntity) => entity is EcsEntity<G> {
	return (entity: EcsEntity): entity is EcsEntity<G> => {
		return hasEcsComponents(entity, components);
	};
}
/**
 * A type utility that throws an error if the entity does not have all of the required components.
 *
 * @note Do not use this to reject a behavior tree node, instead don't start the tree.
 */
export function assertEcsComponents<G extends EcsComponent<any, any>>(
	entity: EcsEntity,
	components: G[],
): asserts entity is EcsEntity<G> {
	if (!hasEcsComponents(entity, components)) {
		debugger;
		throw new Error('Programmer error, entity does not have the required component');
	}
}
