import {
	Blueprint,
	Command,
	EcsArchetype,
	EcsEntity,
	EntityBlackboard,
	Material,
	Prompt,
	SurfaceType,
	assertEcsComponents,
	createFactoryForBlueprint,
	createMarketForMaterial,
	factoryArchetype,
	hasEcsComponents,
	locationComponent,
	marketArchetype,
	pathableComponent,
	surfaceComponent,
} from '@lib/core';
import { headOfState } from '../heroes/heroes.ts';

type TileEntity = EcsEntity<
	typeof locationComponent | typeof surfaceComponent | typeof pathableComponent
>;

/**
 * Identifier for the prompt that asks the user to select an entity to construct.
 */
export const PROMPT_CONSTRUCTION_JOB = new Prompt<{
	buildingType: EcsArchetype<any, any>;
	buildingFocus: Blueprint | Material;
}>();

/**
 * A command that queues an unknown surface area for excavation by a worker. Excavating it will make
 * the surface walkable/pathable.
 */
export const constructEntity = new Command<EntityBlackboard>(
	'🚧 Build a thing here',

	({ entity }) =>
		// Only valid for tiles...
		hasEcsComponents(entity, [locationComponent, pathableComponent, surfaceComponent]) &&
		// ... that are not already cleared...
		entity.surfaceType.get() === SurfaceType.OPEN,

	async ({ game, entity: tile }) => {
		assertEcsComponents(tile, [locationComponent, pathableComponent, surfaceComponent]);
		try {
			const { buildingType, buildingFocus } = await game.prompt(PROMPT_CONSTRUCTION_JOB);
			// TODO:
			// Create a "construction site" entity
			// ... which `await deliveryByAnyon(buildingMaterials)`
			// ... then passes some time and requirs some workers with specific tools
			// .. and finally creates a factory or market.
			// For now, just create the factory/market right away:
			if (buildingType === factoryArchetype) {
				game.entities.add(
					await createFactoryForBlueprint(
						buildingFocus as Blueprint,
						headOfState,
						tile.location.get(),
					),
				);
			} else if (buildingType === marketArchetype) {
				game.entities.add(
					await createMarketForMaterial(
						buildingFocus as Material,
						headOfState,
						tile.location.get(),
					),
				);
			} else {
				debugger;
				throw new Error('Unknown building type');
			}
		} catch (error) {
			if (error === undefined) {
				// User cancelled prompt:
				// Do nothing
			} else {
				throw error;
			}
		}
	},
);
