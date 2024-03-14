import { EcsEntity, ReplacementSpace, heroes } from '@lib';
import React, {
	createContext,
	useContext,
	useMemo,
	type FunctionComponent,
	type ReactNode,
} from 'react';
import { useGameContext } from './GameContext.tsx';

type RepSpaceBuckets = {
	entity: EcsEntity;
};

const _ReplacementSpaceContext = createContext<ReplacementSpace<RepSpaceBuckets> | null>(null);

export const ReplacementSpaceContext: FunctionComponent<{
	children: ReactNode;
}> = ({ children }) => {
	const game = useGameContext();
	const space = useMemo(
		() =>
			new ReplacementSpace<RepSpaceBuckets>({
				entity: (id) =>
					id === heroes.headOfState.id ? heroes.headOfState : game.entities.getByKey(id),
			}),
		[game],
	);
	return (
		<_ReplacementSpaceContext.Provider value={space}>{children}</_ReplacementSpaceContext.Provider>
	);
};

export function useReplacementSpaceContext(): ReplacementSpace<RepSpaceBuckets> {
	const space = useContext(_ReplacementSpaceContext);
	if (!space) {
		throw new Error('No replacement space');
	}
	return space;
}
