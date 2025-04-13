import React, {
	createContext,
	useContext,
	useMemo,
	type FunctionComponent,
	type ReactNode,
} from 'react';
import { useGameContext } from './GameContext';
import { visibilityComponent } from 'src/lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';
import { ReplacementSpace } from 'src/lib/level-1/utilities/ReplacementSpace';

type RepSpaceBuckets = {
	entity: EcsEntity<typeof visibilityComponent>;
};

const _ReplacementSpaceContext = createContext<ReplacementSpace<RepSpaceBuckets> | null>(null);

export const ReplacementSpaceContext: FunctionComponent<{
	children: ReactNode;
}> = ({ children }) => {
	const game = useGameContext();
	const space = useMemo(
		() =>
			new ReplacementSpace<RepSpaceBuckets>({
				entity: (id) => {
					if (id === heroes.headOfState.id) {
						return heroes.headOfState;
					}
					return game.entities.getByKey(id) as EcsEntity<
						typeof visibilityComponent
					> | null;
				},
			}),
		[game],
	);
	return (
		<_ReplacementSpaceContext.Provider value={space}>
			{children}
		</_ReplacementSpaceContext.Provider>
	);
};

export function useReplacementSpaceContext(): ReplacementSpace<RepSpaceBuckets> {
	const space = useContext(_ReplacementSpaceContext);
	if (!space) {
		throw new Error('No replacement space');
	}
	return space;
}
