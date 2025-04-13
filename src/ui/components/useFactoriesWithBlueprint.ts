import { useCallback } from 'react';
import { productionComponent } from 'src/lib/level-1/ecs/components/productionComponent.js';
import { Blueprint } from 'src/lib/level-1/ecs/components/productionComponent/Blueprint.js';
import { EcsEntity } from 'src/lib/level-1/ecs/types.js';
import { useGameContext } from '../context/GameContext';
import { useMemoFromEvent } from '../hooks/useEventedValue';

export function useEntitiesWithBlueprint(blueprint: Blueprint | null) {
	const game = useGameContext();

	const transform = useCallback(
		(_added: EcsEntity[], _removed: EcsEntity[]) =>
			game.entities
				.filter<
					EcsEntity<typeof productionComponent>
				>((entity) => productionComponent.test(entity))
				.filter((entity) => entity.blueprint.get() === blueprint),
		[game.entities, blueprint],
	);

	if (!blueprint) {
		return [];
	}
	return useMemoFromEvent<[EcsEntity[], EcsEntity[]], EcsEntity<typeof productionComponent>[]>(
		game.entities.$change,
		transform([], []),
		transform,
	);
}
