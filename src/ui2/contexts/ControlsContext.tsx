import React, { createContext, useCallback, useContext, useState } from 'react';
import { EcsEntity } from '../../lib/level-1/ecs/types';

/**
 * Represents the state of the map UI controls
 */
interface ControlsState {
	/** The currently selected entity, if any */
	selectedEntity: EcsEntity | null;
	/** The currently selected tool item */
	selectedTool: string | null;
}

/**
 * Provides methods to control the map UI state
 */
interface ControlsContext {
	/** The current state of the map controls */
	state: ControlsState;
	/** Selects an entity on the map */
	selectEntity: (entity: EcsEntity | null) => void;
	/** Selects a tool item */
	selectTool: (tool: string | null) => void;
	/** Clears all selections */
	clearSelections: () => void;
}

const ControlsContext = createContext<ControlsContext | null>(null);

/**
 * Provider component that makes the UI controls available to its children
 */
export const ControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<ControlsState>({
		selectedEntity: null,
		selectedTool: null,
	});

	const selectEntity = useCallback((entity: EcsEntity | null) => {
		setState((prev) => ({ ...prev, selectedEntity: entity }));
	}, []);

	const selectTool = useCallback((tool: string | null) => {
		setState((prev) => ({ ...prev, selectedTool: tool, selectedToolSubItem: null }));
	}, []);

	const clearSelections = useCallback(() => {
		setState({
			selectedEntity: null,
			selectedTool: null,
		});
	}, []);

	const value: ControlsContext = {
		state,
		selectEntity,
		selectTool,
		clearSelections,
	};

	return <ControlsContext.Provider value={value}>{children}</ControlsContext.Provider>;
};

/**
 * Hook to access the UI controls
 * @throws Error if used outside of a UiProvider
 */
export const useControlsContext = (): ControlsContext => {
	const context = useContext(ControlsContext);
	if (!context) {
		throw new Error('useControlsContext must be used within a ControlsProvider');
	}
	return context;
};
