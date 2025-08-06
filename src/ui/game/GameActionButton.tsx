import { FC, useCallback } from 'react';
import { Action } from '../actions/types';
import { useGameContext } from '../contexts/GameContext';
import { Button } from '../hud/atoms/Button';
import { setSelectedAction, useSelectedActionStore } from '../stores/selectedActionStore';

export const GameActionButton: FC<{ options: Action }> = ({ options }) => {
	const game = useGameContext();
	const onClick = useCallback(async () => {
		try {
			await setSelectedAction(options);
			await options.onInteractWithGame(game);
		} catch (error) {
			console.error(error);
		} finally {
			// setSelectedAction(null);
		}
		await setSelectedAction(null);
	}, [game, options]);

	const isSelected = useSelectedActionStore((state) => state.selectedAction === options);

	return (
		<Button icon={options.icon} layout='tile' onClick={onClick} active={isSelected}>
			{options.label ?? null}
		</Button>
	);
};
