import { create } from 'zustand';
import { Terrain } from '../../game/core/terrain/Terrain';

interface SelectedTerrainStore {
	selectedTerrain: Terrain | null;
	setSelectedTerrain: (terrain: Terrain | null) => void;
}

export const useSelectedTerrainStore = create<SelectedTerrainStore>((set) => ({
	selectedTerrain: null,
	setSelectedTerrain: (terrain) => set({ selectedTerrain: terrain }),
}));

export const setSelectedTerrain = (terrain: Terrain | null) => {
	useSelectedTerrainStore.getState().setSelectedTerrain(terrain);
};

export const getSelectedTerrain = (): Terrain | null => {
	return useSelectedTerrainStore.getState().selectedTerrain;
};
