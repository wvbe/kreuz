import React, { useMemo, type FunctionComponent } from 'react';

import { ReplacementSpace } from '@lib';

import { useGameContext } from '../../context/GameContext.tsx';
import { useReplacementSpaceContext } from '../../context/ReplacementSpaceContext.tsx';
import { headOfState } from '../../../library/level-2/heroes.ts';

export const TokenizedText: FunctionComponent<{ text: string }> = ({ text }) => {
	const game = useGameContext();
	const space = useReplacementSpaceContext();

	const derped = useMemo(() => space.replace(text), [space, text]);
	return (
		<>
			{derped.map((item, i) => {
				if (!item) {
					return null;
				}
				if (typeof item === 'string') {
					return item;
				}
				return <a href="#">{item.label}</a>;
			})}
		</>
	);
};
