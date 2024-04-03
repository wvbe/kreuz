import { EcsEntity, locationComponent } from '@lib';
import React, { FC } from 'react';
import { useGameContext } from '../context/GameContext.tsx';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';
import { MapTileContextMenuSection } from './MapTileContextMenuSection.tsx';

export const MapTileContextMenu: FC<{
	tile: EcsEntity<typeof locationComponent>;
}> = ({ tile }) => {
	const game = useGameContext();
	const selectedEntity = useSelectedEntity();

	const tileEntities = game.entities.filter(
		(entity) =>
			locationComponent.test(entity) &&
			(entity as EcsEntity<typeof locationComponent>).equalsMapLocation(tile.location.get()),
	);
	return (
		<div className="map-tile-context-menu">
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
	);
};
