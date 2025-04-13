import { type EcsArchetype } from './classes/EcsArchetype';
import { type EcsComponent } from './classes/EcsComponent';

/**
 * Utility type to convert a union type (|) to an intersection type (&).
 */
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
	? I
	: never;

type _EcsDataFromComponent<ComponentGeneric extends EcsComponent<any, any>> =
	ComponentGeneric extends EcsComponent<any, infer Data> ? Data : never;

/**
 * An entity, with the components as per the `ComponentGeneric` type parameter.
 */
export type EcsEntity<
	RequiredComponents extends EcsComponent<any, any> = EcsComponent,
	OptionalComponents extends EcsComponent<any, any> = EcsComponent,
> = {
	id: string;
} & UnionToIntersection<_EcsDataFromComponent<RequiredComponents>> &
	UnionToIntersection<Partial<_EcsDataFromComponent<OptionalComponents>>>;

/**
 * An entity with all the components of the `ArchetypeGeneric` type parameter archetype.
 */
export type EcsArchetypeEntity<ArchetypeGeneric extends EcsArchetype<any, any>> =
	ArchetypeGeneric extends EcsArchetype<any, infer Component> ? EcsEntity<Component> : never;
