import Game from '../../Game.ts';
import { EcsEntity } from '../types.ts';
import { EcsComponent } from './EcsComponent.ts';

type EcsArchetypeAttachor<OptionsGeneric extends Record<string, unknown>> = (
	entity: EcsEntity,
	options: OptionsGeneric,
) => void;

let identifier = 0;

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

	public create(options: OptionsGeneric): EcsEntity<ComponentGeneric> {
		const entity: EcsEntity = {
			id: `${identifier++}`,
		};
		this.#attachEntity(entity, options);
		if (!this.test(entity)) {
			// You forgot to attach all relevant components to this entity, in #attachEntity
			throw new Error('Entity failed its own archetype test');
		}
		return entity as EcsEntity<ComponentGeneric>;
	}

	public test(entity: EcsEntity) {
		for (const component of this.components) {
			if (!component.test(entity)) {
				return false;
			}
		}
		return true;
	}
}
