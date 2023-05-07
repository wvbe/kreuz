import React, { useMemo, type FunctionComponent } from 'react';

import { ReplacementBuckets, replace } from '@lib';

import { useGameContext } from '../../context/GameContext.tsx';
import { headOfState } from '../../../library/level-2/heroes.ts';

export const TokenizedText: FunctionComponent<{ text: string }> = ({ text }) => {
	const game = useGameContext();
	const buckets = useMemo<ReplacementBuckets>(
		() => ({
			entity: (id) => (id === headOfState.id ? headOfState : game.entities.getByKey(id)),
		}),
		[game],
	);

	const derped = useMemo(() => replace(buckets, text), [buckets, text]);
	return (
		<>
			{derped.map((item, i) => {
				if (typeof item === 'string') {
					return item;
				}
				return <b>{item.label}</b>;
			})}
		</>
	);
};
