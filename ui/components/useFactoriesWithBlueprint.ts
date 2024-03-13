import { Blueprint, EntityI, FactoryBuildingEntity } from '@lib';
import { useCallback } from 'react';
import { useGameContext } from '../context/GameContext.tsx';
import { useMemoFromEvent } from '../hooks/useEventedValue.ts';

export function useFactoriesWithBlueprint(blueprint: Blueprint | null) {
	const game = useGameContext();

	const filter = useCallback(
		(entity: EntityI) => (entity as FactoryBuildingEntity).$blueprint?.get() === blueprint,
		[blueprint],
	);

	const transform = useCallback(
		(_added: EntityI[], _removed: EntityI[]) => game.entities.filter(filter),
		[game.entities, filter],
	);

	if (!blueprint) {
		return [];
	}
	return useMemoFromEvent(game.entities.$change, game.entities.filter(filter), transform);
}
