import { visibilityComponent } from '@lib';
import React, { FC, PropsWithChildren, useMemo } from 'react';

import { useGameContext } from '../context/GameContext.tsx';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';

import { EcsEntity, locationComponent } from '@lib';
import { EntityBadge } from '../entities/EntityBadge.tsx';
import { useMapTileContextMenu } from './MAP_TILE_CONTEXT_MENU.ts';

const MapTileContextMenuItem: FC<
	PropsWithChildren & { onClick?: () => void; isDisabled?: boolean; entity: EcsEntity }
> = ({ children, entity, onClick, isDisabled }) => {
	const game = useGameContext();
	const contextMenu = useMapTileContextMenu();
	const items = useMemo(
		() => game.assets.commands.toArray().filter((command) => command.isAllowed({ game, entity })),
		[game, entity],
	);
	const className = useMemo(
		() =>
			[
				'map-tile-context-menu_item',
				isDisabled && 'map-tile-context-menu_item--disabled',
				onClick && !isDisabled && 'map-tile-context-menu_item--interactive',
			]
				.filter(Boolean)
				.join(' '),
		[isDisabled],
	);
	return (
		<>
			<div className={className} onClick={(!isDisabled && onClick) || undefined}>
				{children}
			</div>
			{items.map((command) => (
				<div
					key={command.label}
					onClick={() => {
						console.log('Execute command', command);
						command.execute({ game, entity });
						contextMenu.close();
					}}
				>
					{command.label}
				</div>
			))}
		</>
	);
};

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
			<MapTileContextMenuItem entity={tile}>
				{tile.location
					.get()
					.map((num) => num.toFixed(2))
					.join(', ')}
			</MapTileContextMenuItem>
			{tileEntities
				.filter((entity): entity is EcsEntity<typeof visibilityComponent> =>
					visibilityComponent.test(entity),
				)
				.map((entity) => (
					<MapTileContextMenuItem
						key={entity.id}
						onClick={() => selectedEntity.set(entity)}
						entity={entity}
					>
						<EntityBadge entity={entity} />
					</MapTileContextMenuItem>
				))}
		</div>
	);
};
