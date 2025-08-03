import { create } from 'zustand';
import { Action } from '../actions/types';
import { defaultViewportControls, ViewportControls } from '../util/Viewport';

interface SelectedToolStore {
	viewportControls: ViewportControls;
	setControls: (controls: ViewportControls) => void;
	selectedAction: Action | null;
	setSelectedAction: (terrain: Action | null) => void;
}

export const useSelectedToolStore = create<SelectedToolStore>((set) => ({
	viewportControls: defaultViewportControls,
	setControls: (controls) => set({ viewportControls: controls }),
	selectedAction: null,
	setSelectedAction: (selectedTool) => set({ selectedAction: selectedTool }),
}));

export const setViewportControls = (controls: ViewportControls) => {
	useSelectedToolStore.getState().setControls(controls);
};

export const getViewportControls = (): ViewportControls => {
	return useSelectedToolStore.getState().viewportControls;
};

export const setSelectedAction = (entity: Action | null) => {
	useSelectedToolStore.getState().setSelectedAction(entity);
};

export const getSelectedAction = (): Action | null => {
	return useSelectedToolStore.getState().selectedAction;
};
