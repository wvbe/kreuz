import { Blueprint, EcsEntity, productionComponent } from '@lib';
import { useCallback } from 'react';
import { useGameContext } from '../context/GameContext.tsx';
import { useMemoFromEvent } from '../hooks/useEventedValue.ts';

export function useEntitiesWithBlueprint(blueprint: Blueprint | null) {
	const game = useGameContext();

	const transform = useCallback(
		(_added: EcsEntity[], _removed: EcsEntity[]) =>
			game.entities
				.filter<EcsEntity<typeof productionComponent>>((entity) => productionComponent.test(entity))
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
