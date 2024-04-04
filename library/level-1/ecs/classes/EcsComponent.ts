import { EcsEntity } from '../types.ts';

type EcsComponentFilter = (entity: EcsEntity) => boolean;

type EcsComponentAttachor<OptionsGeneric extends { [key: string]: unknown }> = (
	entity: EcsEntity<any>,
	options: OptionsGeneric,
) => void;

export class EcsComponent<
	OptionsGeneric extends { [key: string]: unknown } = { [key: string]: unknown },
	DataGeneric extends { [key: string]: unknown } = OptionsGeneric,
> {
	/**
	 * The method with which can be determined wether a given entity has this component or not.
	 */
	readonly #test: EcsComponentFilter;

	/**
	 * The method with which this component can be attached to an entity.
	 *
	 * Defaults to simply applying the {@link OptionsGeneric} to the entity.
	 */
	readonly #attach: EcsComponentAttachor<OptionsGeneric>;

	constructor(
		entityTest: EcsComponentFilter,
		entityAttach: EcsComponentAttachor<OptionsGeneric> = (
			entity: EcsEntity,
			options: OptionsGeneric,
		) => {
			Object.assign(entity, options);
		},
	) {
		this.#test = entityTest;
		this.#attach = entityAttach;
	}

	public attach<EntityGeneric extends EcsEntity>(
		entity: EntityGeneric,
		options: OptionsGeneric,
	): EcsEntity<this> {
		this.#attach(entity, options);
		return entity as EcsEntity<this>;
	}

	public test(entity: EcsEntity): entity is EcsEntity<this> {
		return this.#test(entity);
	}
}
