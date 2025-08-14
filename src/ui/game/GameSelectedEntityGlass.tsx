import React from 'react';
import { RoundGlass } from '../hud/atoms/RoundGlass';
import { useSelectedEntityStore } from '../stores/selectedEntityStore';
import { GameEntityIcon } from './GameEntityIcon';
import { GameSelectedEntity } from './GameSelectedEntityControls';

export const GameSelectedEntityGlass: React.FC = () => {
	const selectedEntity = useSelectedEntityStore((state) => state.selectedEntity);
	if (!selectedEntity) {
		return null;
	}

	return (
		<RoundGlass size='10em'>
			<div style={{ fontSize: '0.6em' }}>
				<GameEntityIcon entity={selectedEntity} />
			</div>
		</RoundGlass>
	);
};

export { GameSelectedEntity };
