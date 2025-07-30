import { EcsEntity } from '../types';
import { EcsComponent } from './EcsComponent';

type EcsArchetypeAttachor<OptionsGeneric extends Record<string, unknown>> = (
	entity: EcsEntity,
	options: OptionsGeneric,
) => void;

let identifier = 0;

/**
 * An ECS (Entity-Component-System) archetype is a blueprint that defines a specific combination of components
 * that an entity can have in an ECS architecture. It serves as a template for creating entities with a predefined
 * set of components, ensuring that entities conform to a particular structure or role within the game.
 * Archetypes help in organizing and managing entities by grouping them based on their component composition,
 * allowing for efficient processing and interaction within the ECS framework.
 */
export class EcsArchetype<
	OptionsGeneric extends Record<string, unknown>,
	ComponentGeneric extends EcsComponent<any>,
> {
	public readonly components: ComponentGeneric[];

	readonly #attachEntity: EcsArchetypeAttachor<OptionsGeneric>;

	constructor(
		componentDependencies: ComponentGeneric[],
		attachEntity: EcsArchetypeAttachor<OptionsGeneric>,
	) {
		this.components = componentDependencies;
		this.#attachEntity = attachEntity;
	}

	/**
	 * Create a new entity with this archetype.
	 */
	public create(options: OptionsGeneric): EcsEntity<ComponentGeneric> {
		const entity: EcsEntity = {
			id: `${identifier++}`,
			archetype: this,
		};
		this.#attachEntity(entity, options);
		if (!this.test(entity)) {
			// You forgot to attach all relevant components to this entity, in #attachEntity
			throw new Error(`Programmer error, entity ${entity.id} failed its own archetype test`);
		}
		return entity as EcsEntity<ComponentGeneric>;
	}

	/**
	 * Asserts wether or not the given entity matches this archetype. If the entity was created from
	 * an archetype, simply see if it was the same. Otherwise, test each of the components associated
	 * with the archetype to look for a match. Entities who have a superset of the archetype components
	 * are a false positive… or are they?
	 */
	public test(entity: any): entity is EcsEntity<ComponentGeneric> {
		if (!entity?.id) {
			return false;
		}

		if (entity.archetype) {
			return entity.archetype === this;
		}

		for (const component of this.components) {
			if (!component.test(entity)) {
				return false;
			}
		}
		return true;
	}
}
