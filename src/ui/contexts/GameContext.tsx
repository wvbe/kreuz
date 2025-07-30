import { type FunctionComponent, type ReactNode, createContext, useContext } from 'react';
import Game from '../../game/core/Game';

const _GameContext = createContext<Game | null>(null);

export const GameContext: FunctionComponent<{
	game: Game;
	children: ReactNode;
}> = ({ game, children }) => <_GameContext.Provider value={game}>{children}</_GameContext.Provider>;

export function useGameContext(): Game {
	const game = useContext(_GameContext);
	if (!game) {
		throw new Error('No game');
	}
	return game;
}
