import React, { FC, PropsWithChildren } from 'react';
import { DriverI } from '../lib/level-1/drivers/types';
import Game from '../lib/level-1/Game';
import { ModalHost } from '../ui/modals/ModalHost';
import { ControlsProvider } from './contexts/ControlsContext';
import { DriverContext } from './contexts/DriverContext';
import { GameContext } from './contexts/GameContext';
import { ReplacementSpaceContext } from './contexts/ReplacementSpaceContext';

export const Contexts: FC<PropsWithChildren<{ driver: DriverI; game: Game }>> = ({
	children,
	driver,
	game,
}) => {
	return (
		<ControlsProvider>
			<DriverContext driver={driver}>
				<GameContext game={game}>
					<ReplacementSpaceContext>
						{children}
						<ModalHost />
					</ReplacementSpaceContext>
				</GameContext>
			</DriverContext>
		</ControlsProvider>
	);
};
