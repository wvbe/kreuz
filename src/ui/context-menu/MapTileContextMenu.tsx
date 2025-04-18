import React, { FC } from 'react';
import { tileArchetype } from '../../lib/level-1/ecs/archetypes/tileArchetype';
import { locationComponent } from '../../lib/level-1/ecs/components/locationComponent';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { useGameContext } from '../../ui2/contexts/GameContext';
import { ErrorBoundary } from '../../ui2/util/ErrorBoundary';
import { useSelectedEntity } from '../hooks/useSelectedEntity';
import { MapTileContextMenuSection } from './MapTileContextMenuSection';

export const MapTileContextMenu: FC<{
	tile: EcsEntity<typeof locationComponent>;
}> = ({ tile }) => {
	const game = useGameContext();
	const selectedEntity = useSelectedEntity();

	const tileEntities = game.entities.filter(
		(entity) =>
			locationComponent.test(entity) &&
			!tileArchetype.test(entity) &&
			(entity as EcsEntity<typeof locationComponent>).equalsMapLocation(tile.location.get()),
	);
	return (
		<ErrorBoundary>
			<div className='panel map-tile-context-menu'>
				{[tile, ...tileEntities]
					// .filter((entity): entity is EcsEntity<typeof visibilityComponent> =>
					// 	visibilityComponent.test(entity),
					// )
					.map((entity) => (
						<MapTileContextMenuSection
							key={entity.id}
							onClick={() => selectedEntity.set(entity)}
							entity={entity}
						/>
					))}
			</div>
		</ErrorBoundary>
	);
};
