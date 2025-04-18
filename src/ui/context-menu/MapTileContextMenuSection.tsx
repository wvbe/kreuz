import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react';

import { EcsEntity } from '../../lib/level-1/ecs/types';
import { useGameContext } from '../../ui2/contexts/GameContext';
import { EntityBadge } from '../entities/EntityBadge';
import { useNavigation } from '../hooks/useNavigation';
import { ROUTE_ENTITIES_DETAILS } from '../routes/ROUTES';
import { useMapTileContextMenu } from './MAP_TILE_CONTEXT_MENU';
import { MapTileContextMenuItem } from './MapTileContextMenuItem';

export const MapTileContextMenuSection: FC<
	PropsWithChildren & {
		onClick?: () => void;
		isDisabled?: boolean;
		entity: EcsEntity;
	}
> = ({ entity }) => {
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
		<div className='map-tile-context-menu_section'>
			<MapTileContextMenuItem onClick={onBadgeClick}>
				<EntityBadge entity={entity} />
			</MapTileContextMenuItem>
			{items}
		</div>
	);
};
