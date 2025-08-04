import {
	DetailedHTMLProps,
	FunctionComponent,
	HTMLAttributes,
	MouseEventHandler,
	useCallback,
} from 'react';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { useEventedValue } from '../hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';
import { setSelectedEntity, useSelectedEntityStore } from '../stores/selectedEntityStore';
import { useSelectedTerrainStore } from '../stores/selectedTerrainStore';
import { useGameContextMenuOpener } from './GameContextMenu';
import { GameEntityIcon } from './GameEntityIcon';
import { useGameContext } from '../contexts/GameContext';

/**
 * A component that maps a game entity to a presentational map location.
 *
 * This component uses the {@link MapLocation} presentational component to display the entity's location on the map.
 */
export const GameMapEntity: FunctionComponent<
	{
		entity: EcsEntity<typeof locationComponent | typeof visibilityComponent>;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ entity, ...rest }) => {
	const game = useGameContext();
	const isSelected = useSelectedEntityStore((state) => state.selectedEntity === entity);
	const selectedTerrain =
		useSelectedTerrainStore((state) => state.selectedTerrain) ?? game.terrain;
	const contextMenu = useGameContextMenuOpener();

	const onContextMenu = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			return; // Context menu is disabled for now
			// const tile = game.terrain.getTileEqualToLocation(entity.location.get());
			// if (!tile) {
			// 	throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
			// }
			// contextMenu.open(event, { tile });
		},
		[contextMenu],
	);

	const onClick = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			setSelectedEntity(entity);
			event.stopPropagation();
		},
		[entity],
	);
	const [terrain, x, y] = useEventedValue(entity.location);

	if (terrain !== selectedTerrain) {
		return null;
	}

	return (
		<MapLocation
			eventedQualifiedCoordinates={entity.location}
			zIndex={entity.visiblityPriority}
			onClick={onClick}
			onContextMenu={onContextMenu}
			style={{ transition: 'all 0.1s ease-in-out' }}
			{...rest}
		>
			<div
				style={{
					minWidth: '1em',
					maxWidth: '1em',
					height: '1em',
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: isSelected ? 'yellow' : 'transparent',
				}}
			>
				<div
					style={{
						fontSize: `${entity.iconSize}em`,
					}}
				>
					<GameEntityIcon entity={entity} />
				</div>
			</div>
		</MapLocation>
	);
};
