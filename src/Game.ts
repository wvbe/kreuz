import { createContext, useContext } from 'react';
import { Scene } from './classes/Scene';
import { ContextMenuManager } from './ui/ContextMenu';

export class Game {
	public readonly contextMenu = new ContextMenuManager();
	public readonly scene: Scene;

	constructor(scene: Scene) {
		this.scene = scene;
	}
}

export const GameContext = createContext<null | Game>(null);

export const useGame = () => {
	const gameApi = useContext(GameContext);
	if (!gameApi) {
		throw new Error('Game context does not exist');
	}
	return gameApi;
};
