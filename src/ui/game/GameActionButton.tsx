import { FC, useCallback } from 'react';
import { Action } from '../actions/types';
import { useGameContext } from '../contexts/GameContext';
import { Button } from '../hud/atoms/Button';
import {
	getViewportControls,
	setSelectedAction,
	useSelectedToolStore,
} from '../stores/selectedActionStore';

export const GameActionButton: FC<{ options: Action }> = ({ options }) => {
	const game = useGameContext();
	const onClick = useCallback(async () => {
		setSelectedAction(options);

		// Pause panning/zooming until the action is complete or cancelled:
		const controls = getViewportControls();
		controls.getPanzoomInstance()?.pause();

		try {
			await options.onClick(game);
		} catch (error) {
			console.error(error);
		} finally {
			setSelectedAction(null);
			controls.getPanzoomInstance()?.resume();
		}
	}, [game, options]);

	const isSelected = useSelectedToolStore((state) => state.selectedAction === options);

	return <Button icon={options.icon} layout='tile' onClick={onClick} active={isSelected} />;
};
