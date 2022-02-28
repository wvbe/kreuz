import { createContext, useContext } from 'react';
import { Game } from '../Game';

export const GameContext = createContext<null | Game>(null);

export function useGame() {
	const gameApi = useContext(GameContext);
	if (!gameApi) {
		throw new Error('Game context does not exist');
	}
	return gameApi;
}
