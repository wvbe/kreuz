import { create } from 'zustand';
import { EcsEntity } from '../../game/core/ecs/types';

interface SelectedEntityStore {
	selectedEntity: EcsEntity | null;
	setSelectedEntity: (terrain: EcsEntity | null) => void;
}

export const useSelectedEntityStore = create<SelectedEntityStore>((set) => ({
	selectedEntity: null,
	setSelectedEntity: (entity) => set({ selectedEntity: entity }),
}));

export const setSelectedEntity = (entity: EcsEntity | null) => {
	useSelectedEntityStore.getState().setSelectedEntity(entity);
};

export const getSelectedEntity = (): EcsEntity | null => {
	return useSelectedEntityStore.getState().selectedEntity;
};
