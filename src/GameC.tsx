import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { Game } from './Game';
import { useEventedValue } from './hooks/events';
import { RendererMain } from './rendering/RendererMain';
import { EntityI } from './types';
import { AboutGameOverlay } from './ui/AboutGameOverlay';
import { ActiveEntityOverlay } from './ui/ActiveEntityOverlay';

const UiHost = styled.section`
	position: absolute;
	bottom: 2em;
	left: 2em;
`;

export const GameC: FunctionComponent<{
	game: Game;
}> = ({ game }) => {
	const focusedItem = useEventedValue(game.$$focus);

	return (
		<>
			<RendererMain />
			<UiHost>
				<ActiveEntityOverlay entity={focusedItem as EntityI} />
				<AboutGameOverlay />
			</UiHost>
		</>
	);
};
