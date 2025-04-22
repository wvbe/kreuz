import React, {
	DetailedHTMLProps,
	FunctionComponent,
	HTMLAttributes,
	MouseEventHandler,
	useCallback,
} from 'react';
import { locationComponent } from '../../lib/level-1/ecs/components/locationComponent';
import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { useEventedValue } from '../../ui/hooks/useEventedValue';
import { useControlsContext } from '../contexts/ControlsContext';
import { useGameContext } from '../contexts/GameContext';
import { MapLocation } from '../map/MapLocation';
import { useGameContextMenuOpener } from './GameContextMenu';
import { GameEntityIcon } from './GameEntityIcon';

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
	const { state, selectEntity } = useControlsContext();

	const isSelected = state.selectedEntity === entity;

	const contextMenu = useGameContextMenuOpener();

	const game = useGameContext();

	const onContextMenu = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			return; // Context menu is disabled for now
			const tile = game.terrain.getTileEqualToLocation(entity.location.get());
			if (!tile) {
				throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
			}
			contextMenu.open(event, { tile });
		},
		[contextMenu],
	);

	const onClick = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			selectEntity(entity);
			event.stopPropagation();
		},
		[selectEntity, entity],
	);
	const [x, y] = useEventedValue(entity.location);

	return (
		<MapLocation
			x={x}
			y={y}
			onClick={onClick}
			onContextMenu={onContextMenu}
			style={{ transition: 'all 0.1s ease-in-out' }}
			{...rest}
		>
			<div
				style={{
					minWidth: '0.8em',
					maxWidth: '0.8em',
					height: '0.8em',
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
