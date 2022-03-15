import React, { FunctionComponent } from 'react';
import { Game } from './Game';
import { useEventedValue } from './hooks/events';
import { RendererMain } from './rendering/RendererMain';
import { EntityI } from './types';
import { AboutGameOverlay } from './ui/AboutGameOverlay';
import { ActiveEntityOverlay } from './ui/ActiveEntityOverlay';
import { Overlay } from './ui/Overlay';

export const GameC: FunctionComponent<{
	game: Game;
}> = ({ game }) => {
	const focusedItem = useEventedValue(game.$$focus);

	return (
		<>
			<RendererMain />
			<Overlay>
				<ActiveEntityOverlay entity={focusedItem as EntityI} />
				<AboutGameOverlay />
			</Overlay>
		</>
	);
};
