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
import { useControlsContext } from '../contexts/ControlsContext';
import { useEventedValue } from '../hooks/useEventedValue';
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
			selectEntity(entity);
			event.stopPropagation();
		},
		[selectEntity, entity],
	);
	const [_terrain, x, y] = useEventedValue(entity.location);

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
