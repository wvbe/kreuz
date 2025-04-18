import React, { useCallback } from 'react';
import { hasEcsComponents } from '../../lib/level-1/ecs/assert';
import { locationComponent } from '../../lib/level-1/ecs/components/locationComponent';
import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { wealthComponent } from '../../lib/level-1/ecs/components/wealthComponent';
import { useControlsContext } from '../contexts/ControlsContext';
import { useGameContext } from '../contexts/GameContext';
import EntityControls from '../hud/EntityControls';
import { GameEntityIcon } from './GameEntityIcon';

const GameSelectedEntity: React.FC = () => {
	const { state } = useControlsContext();
	const game = useGameContext();

	const renderEntityComponent = useCallback(() => {
		const { selectedEntity } = state;
		if (!selectedEntity) {
			return null;
		}

		const visual = (
			<div style={{ fontSize: `${selectedEntity.iconSize}em` }}>
				<GameEntityIcon entity={selectedEntity} />
			</div>
		);

		const entityInfo: {
			key: string;
			value: string;
		}[] = [];

		if (hasEcsComponents(selectedEntity, [visibilityComponent])) {
			entityInfo.push({ key: 'Name', value: selectedEntity.name });
		}

		if (hasEcsComponents(selectedEntity, [locationComponent])) {
			entityInfo.push({
				key: 'Location',
				value: `(${selectedEntity.location.get().join(', ')})`,
			});
		}

		if (hasEcsComponents(selectedEntity, [wealthComponent])) {
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
