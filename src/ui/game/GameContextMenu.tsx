import { FC, useMemo } from 'react';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { useGameContext } from '../contexts/GameContext';
import { ContextMenu, ContextMenuSection } from '../hud/ContextMenu';
import { createContextMenu } from '../util/createContextMenu';
import { GameEntityBadge } from './GameEntityBadge';

/**
 * A component that maps a game tile to a presentational context menu.
 *
 * This component uses the {@link ContextMenu} presentational component to display options for a given game tile.
 */
const GameContextMenu: FC<{ tile: EcsEntity<typeof locationComponent> }> = ({ tile }) => {
	const game = useGameContext();
	const sections = useMemo<ContextMenuSection[]>(() => {
		const location = tile.location.get();
		const entities = game.entities.filter(
			(entity) =>
				locationComponent.test(entity) &&
				(entity as EcsEntity<typeof locationComponent>).equalsMapLocation(location),
		);
		return entities.map((entity) => ({
			header: <GameEntityBadge entity={entity} />,
			items: [
				{
					label: 'Do somthing',
					onClick: () => {},
				},
			],
		}));
	}, [game.entities, tile]);

	return <ContextMenu sections={sections} />;
};

const gameContextMenu = createContextMenu(GameContextMenu);

export const GameContextMenuHost = gameContextMenu.Host;

export const useGameContextMenuOpener = gameContextMenu.use;
