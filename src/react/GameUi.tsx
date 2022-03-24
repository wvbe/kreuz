import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import Game from '../Game';
import { useEventedValue } from './hooks/events';
import { GameContext } from './hooks/game';
import { RendererMain } from './ThreeViewportMain';
import GLOBAL_STYLE_RULES from '../style/global';
import { EntityI } from '../types';
import { AboutGameOverlay } from './AboutGameOverlay';
import { ActiveEntityOverlay } from './ActiveEntityOverlay';
import { ModalBoundsContext } from './components/Modal';
import { EntityOverview } from './EntityOverview';
import { Global } from '@emotion/react';

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

const GameUi: FunctionComponent<{
	game: Game;
}> = ({ game }) => {
	const focusedItem = useEventedValue(game.$$focus);

	return (
		<GameContext.Provider value={game}>
			<UiHostFullScreen className="modal-bounds">
				<Global styles={GLOBAL_STYLE_RULES} />
				<RendererMain />
				<UiHostBottomRight>
					<ActiveEntityOverlay entity={focusedItem as EntityI} />
					<AboutGameOverlay />
				</UiHostBottomRight>
				<ModalBoundsContext.Provider value="modal-bounds">
					<EntityOverview></EntityOverview>
				</ModalBoundsContext.Provider>
			</UiHostFullScreen>
		</GameContext.Provider>
	);
};

export default GameUi;
