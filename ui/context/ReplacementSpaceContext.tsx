import React, {
	type FunctionComponent,
	type ReactNode,
	createContext,
	useContext,
	useMemo,
} from 'react';
import { ReplacementSpace, type EntityI } from '@lib';
import { useGameContext } from './GameContext.tsx';

type RepSpaceBuckets = {
	entity: EntityI;
};

const _ReplacementSpaceContext = createContext<ReplacementSpace<RepSpaceBuckets> | null>(null);

export const ReplacementSpaceContext: FunctionComponent<{
	children: ReactNode;
}> = ({ children }) => {
	const game = useGameContext();
	const space = useMemo(
		() =>
			new ReplacementSpace<RepSpaceBuckets>({
				entity: (id) => game.entities.getByKey(id),
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
