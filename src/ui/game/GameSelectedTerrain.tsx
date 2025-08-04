import { PropsWithChildren, type FC } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useSelectedTerrainStore } from '../stores/selectedTerrainStore';
import { GameTerrain } from './GameTerrain';

/**
 * A component that renders the currently selected terrain using the GameTerrain component.
 *
 * If no terrain is currently selected via the selectedTerrainStore, it defaults to
 * rendering the main game terrain (game.terrain).
 *
 * The selected terrain can be set from outside React using the setSelectedTerrain function
 * from the selectedTerrainStore.
 *
 * @param tilePaintMode - Optional tile paint mode for interactive terrain editing
 */
export const GameSelectedTerrain: FC<PropsWithChildren> = ({ children }) => {
	const game = useGameContext();
	const selectedTerrain = useSelectedTerrainStore((state) => state.selectedTerrain);

	// Use selected terrain if available, otherwise default to game.terrain
	const terrainToRender = selectedTerrain ?? game.terrain;

	return <GameTerrain terrain={terrainToRender} />;
};
