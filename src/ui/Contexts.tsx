import { FC, PropsWithChildren } from 'react';
import { DriverI } from '../game/core/drivers/types';
import Game from '../game/core/Game';
import { DriverContext } from './contexts/DriverContext';
import { GameContext } from './contexts/GameContext';
import { ReplacementSpaceContext } from './contexts/ReplacementSpaceContext';

export const Contexts: FC<PropsWithChildren<{ driver: DriverI; game: Game }>> = ({
	children,
	driver,
	game,
}) => {
	return (
		<DriverContext driver={driver}>
			<GameContext game={game}>
				<ReplacementSpaceContext>{children}</ReplacementSpaceContext>
			</GameContext>
		</DriverContext>
	);
};
