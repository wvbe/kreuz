import React, { useCallback } from 'react';
import { useControlsContext } from '../contexts/ControlsContext';
import { useGameContext } from '../contexts/GameContext';
import EntityControls from '../hud/EntityControls';

const GameSelectedEntity: React.FC = () => {
	const { state } = useControlsContext();
	const game = useGameContext();

	const renderEntityComponent = useCallback(() => {
		const { selectedEntity } = state;
		if (!selectedEntity) {
			return null;
		}

		const visual = (
			<div style={{ fontSize: `${selectedEntity.iconSize}em` }}>{selectedEntity.icon}</div>
		);

		const entityInfo: EntityInfo[] = [
			{ key: 'ID', value: selectedEntity.id },
			{ key: 'Location', value: `(${selectedEntity.location.get().join(', ')})` },
		];

		if (selectedEntity.wallet) {
			entityInfo.push({ key: 'Wealth', value: selectedEntity.wallet.get().toString() });
		}

		const actions: ButtonAction[] = [
			{
				label: 'Deselect',
				onClick: () => state.setSelectedEntity(null),
			},
		];
		return <EntityControls visual={visual} entityInfo={entityInfo} actions={actions} />;
	}, [state.selectedEntity]);

	return <div data-component='GameSelectedEntity'>{renderEntityComponent()}</div>;
};

export { GameSelectedEntity };
