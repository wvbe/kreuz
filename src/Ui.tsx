import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import Game from './Game';
import { useEventedValue } from './hooks/events';
import { GameContext } from './hooks/game';
import { RendererMain } from './rendering/RendererMain';
import GlobalStyles from './style/GlobalStyles';
import { EntityI } from './types';
import { AboutGameOverlay } from './ui/AboutGameOverlay';
import { ActiveEntityOverlay } from './ui/ActiveEntityOverlay';
import { ModalBoundsContext } from './ui/components/Modal';
import { Overview } from './ui/StuffOverview';

const UiHostBottomRight = styled.section`
	position: absolute;
	bottom: 2em;
	left: 2em;
`;

const UiHostFullScreen = styled.section`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
`;

const Ui: FunctionComponent<{
	game: Game;
}> = ({ game }) => {
	const focusedItem = useEventedValue(game.$$focus);

	return (
		<GameContext.Provider value={game}>
			<UiHostFullScreen className="modal-bounds">
				<GlobalStyles />
				<RendererMain />
				<UiHostBottomRight>
					<ActiveEntityOverlay entity={focusedItem as EntityI} />
					<AboutGameOverlay />
				</UiHostBottomRight>
				<ModalBoundsContext.Provider value="modal-bounds">
					<Overview></Overview>
				</ModalBoundsContext.Provider>
			</UiHostFullScreen>
		</GameContext.Provider>
	);
};

export default Ui;
