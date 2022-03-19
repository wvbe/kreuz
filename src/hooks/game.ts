import { createContext, useContext } from 'react';
import Game from '../Game';

export const GameContext = createContext<null | Game>(null);

export function useGame(): Game;
export function useGame(doNotThrow: true): Game | null;
export function useGame(doNotThrow?: true): Game | null {
	const gameApi = useContext(GameContext);
	if (!gameApi && !doNotThrow) {
		throw new Error('Game context does not exist');
	}
	return gameApi || null;
}
