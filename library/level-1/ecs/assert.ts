import { EcsArchetype } from './classes/EcsArchetype.ts';
import { EcsComponent } from './classes/EcsComponent.ts';
import { type EcsEntity, type EcsArchetypeEntity } from './types.ts';

/**
 * Returns true if the entity has all of the required components.
 */
export function hasEcsComponents<
	RequiredComponents extends EcsComponent<any, any>,
	OptionalComponents extends EcsComponent<any, any>,
>(
	entity: EcsEntity,
	requiredComponents: RequiredComponents[],
	_optionalComponents: OptionalComponents[] = [],
): entity is EcsEntity<RequiredComponents, OptionalComponents> {
	for (const component of requiredComponents) {
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
export function byEcsComponents<
	RequiredComponents extends EcsComponent<any, any>,
	OptionalComponents extends EcsComponent<any, any>,
>(
	requiredComponents: RequiredComponents[],
	optionalComponents: OptionalComponents[] = [],
): (entity: any) => entity is EcsEntity<RequiredComponents, OptionalComponents> {
	return (entity: EcsEntity): entity is EcsEntity<RequiredComponents, OptionalComponents> => {
		return hasEcsComponents(entity, requiredComponents, optionalComponents);
	};
}
/**
 * A type utility that throws an error if the entity does not have all of the required components.
 *
 * @note Do not use this to reject a behavior tree node, instead don't start the tree.
 */
export function assertEcsComponents<
	RequiredComponents extends EcsComponent<any, any>,
	OptionalComponents extends EcsComponent<any, any>,
>(
	entity: EcsEntity,
	requiredComponents: RequiredComponents[],
	optionalComponents: OptionalComponents[] = [],
): asserts entity is EcsEntity<RequiredComponents, OptionalComponents> {
	if (!hasEcsComponents(entity, requiredComponents, optionalComponents)) {
		debugger;
		throw new Error('Programmer error, entity does not have the required component');
	}
}

export function byEcsArchetype<ArcetypeGeneric extends EcsArchetype<any, any>>(
	archetype: ArcetypeGeneric,
): (entity: any) => entity is EcsArchetypeEntity<ArcetypeGeneric> {
	return (entity: EcsEntity): entity is EcsArchetypeEntity<ArcetypeGeneric> => {
		return archetype.test(entity);
	};
}
