import { create } from 'zustand';
import { Action } from '../actions/types';
import { GLOBAL_UNSET_ACTION_LISTENERS } from '../selections/createRectangularSelectionListeners';
import { defaultViewportControls, ViewportControls } from '../util/Viewport';

interface SelectedToolStore {
	viewportControls: ViewportControls;
	setControls: (controls: ViewportControls) => void;
	selectedAction: Action | null;
	setSelectedAction: (terrain: Action | null) => void;
}

export const useSelectedActionStore = create<SelectedToolStore>((set) => ({
	viewportControls: defaultViewportControls,
	setControls: (controls) => set({ viewportControls: controls }),
	selectedAction: null,
	setSelectedAction: (selectedTool) => set({ selectedAction: selectedTool }),
}));

export const setViewportControls = (controls: ViewportControls) => {
	useSelectedActionStore.getState().setControls(controls);
};

export const getViewportControls = (): ViewportControls => {
	return useSelectedActionStore.getState().viewportControls;
};

export const setSelectedAction = async (action: Action | null) => {
	const state = useSelectedActionStore.getState();

	if (state.selectedAction === action) {
		console.log('Action is already selected');
		return;
	}
	if (state.selectedAction && !action) {
		// Setting the current action to null;
		state.viewportControls.getPanzoomInstance()?.resume();
	} else if (!state.selectedAction && action) {
		// Setting the current action to something after being empty
		state.viewportControls.getPanzoomInstance()?.pause();
	} else {
		// Setting the current action to something else
		await GLOBAL_UNSET_ACTION_LISTENERS.emit();
	}

	state.setSelectedAction(action);
};

export const getSelectedAction = (): Action | null => {
	return useSelectedActionStore.getState().selectedAction;
};
