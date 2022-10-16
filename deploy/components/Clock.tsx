import { Game } from '@lib';
import { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { FillBar } from './atoms/FillBar.tsx';

export const Clock: FunctionComponent<{ game: Game }> = ({ game }) => {
	const time = useEventedValue(game.time);
	return (
		<div>
			<FillBar
				ratio={(time % 1000) / 1000}
				label={`${Math.ceil(time / 1000)} hours since start of the game`}
			/>
		</div>
	);
};
