import { Random } from '../../../core/classes/Random';
import { assertEcsComponents, byEcsComponents, hasEcsComponents } from '../../../core/ecs/assert';
import { BehaviorTreeSignal } from '../../../core/ecs/components/behaviorComponent/BehaviorTreeSignal';
import { ExecutionNode } from '../../../core/ecs/components/behaviorComponent/ExecutionNode';
import { type EntityBlackboard } from '../../../core/ecs/components/behaviorComponent/types';
import { eventLogComponent } from '../../../core/ecs/components/eventLogComponent';
import { getTileAtLocation } from '../../../core/ecs/components/location/getTileAtLocation';
import { locationComponent } from '../../../core/ecs/components/locationComponent';
import { needsComponent } from '../../../core/ecs/components/needsComponent';
import { pathingComponent } from '../../../core/ecs/components/pathingComponent';
import { rawMaterialComponent } from '../../../core/ecs/components/rawMaterialComponent';

export function createEatFromRawMaterial() {
	return new ExecutionNode<EntityBlackboard>(
		'Do the work',
		async ({ game, entity }: EntityBlackboard) => {
			assertEcsComponents(entity, [locationComponent, pathingComponent, needsComponent]);

			if (entity.needs.nutrition.get() > 0.3) {
				throw new BehaviorTreeSignal(`I'm full`);
			}

			if (hasEcsComponents(entity, [eventLogComponent])) {
				// @TODO user facing language
				entity.events?.add(`Trying to eat something`);
			}

			const startingLocation = entity.location.get();
			// Throw if this entity is not in a valid tile
			getTileAtLocation(startingLocation);

			const nearbyRawMaterials = game.entities
				.filter(byEcsComponents([locationComponent, rawMaterialComponent]))
				.map((resource) => ({
					entity: resource,
					yummies:
						// Resource contains an edible raw material
						resource.rawMaterials.filter(
							({ material, quantity }) =>
								material.nutrition > 0 && quantity.get() > 0,
						),
					distance:
						// Resource is "close by" (shit implementation)
						resource.euclideanDistanceTo(startingLocation),
				}))
				.filter(({ yummies, distance }) => yummies.length && distance < 30);

			if (!nearbyRawMaterials.length) {
				throw new BehaviorTreeSignal(`There are no resources to eat`);
			}
			const resource = Random.fromArray(nearbyRawMaterials);
			const material = Random.fromArray(resource.yummies);

			if (hasEcsComponents(entity, [eventLogComponent])) {
				// @TODO user facing language
				entity.events?.add(`Munching on ${resource.entity}`);
			}
			await entity.walkToTile(game, getTileAtLocation(resource.entity.location.get()));

			const harvested = await resource.entity.harvestRawMaterial(game, material.material);
			const nutritionalValue = material.material.nutrition * harvested;

			if (hasEcsComponents(entity, [eventLogComponent])) {
				// @TODO user facing language
				entity.events?.add(
					`Eating ${harvested} of ${material.material}, good for ${nutritionalValue} yumyums`,
				);
			}

			entity.needs.nutrition.set(
				Math.min(1, entity.needs.nutrition.get() + nutritionalValue),
			);
		},
	);
}
