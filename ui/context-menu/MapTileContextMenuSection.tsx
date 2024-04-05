import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react';

import { useGameContext } from '../context/GameContext.tsx';
import { MapTileContextMenuItem } from './MapTileContextMenuItem.tsx';
import { EcsEntity } from '@lib';
import { useMapTileContextMenu } from './MAP_TILE_CONTEXT_MENU.ts';
import { EntityBadge } from '../entities/EntityBadge.tsx';
import { useNavigation } from '../hooks/useNavigation.ts';
import { ROUTE_ENTITIES_DETAILS } from '../routes/ROUTES.ts';

export const MapTileContextMenuSection: FC<
	PropsWithChildren & { onClick?: () => void; isDisabled?: boolean; entity: EcsEntity }
> = ({ children, entity, onClick, isDisabled }) => {
	const game = useGameContext();
	const contextMenu = useMapTileContextMenu();
	const navigate = useNavigation();

	const items = useMemo(
		() =>
			game.assets.commands
				.toArray()
				.filter((command) => command.isAllowed({ game, entity }))
				.map((command) => (
					<MapTileContextMenuItem
						key={command.label}
						onClick={() => {
							command.execute({ game, entity });
							contextMenu.close();
						}}
					>
						{command.label}
					</MapTileContextMenuItem>
				)),
		[game, entity],
	);

	const onBadgeClick = useCallback(() => {
		navigate(ROUTE_ENTITIES_DETAILS, { entityId: entity.id });
		contextMenu.close();
	}, [entity, navigate]);

	return (
		<div className="map-tile-context-menu_section">
			<MapTileContextMenuItem onClick={onBadgeClick}>
				<EntityBadge entity={entity} />
			</MapTileContextMenuItem>
			{items}
		</div>
	);
};
