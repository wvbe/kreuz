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
import { useMapTileContextMenu } from '../../ui/context-menu/MAP_TILE_CONTEXT_MENU';
import { useEventedValue } from '../../ui/hooks/useEventedValue';
import { useControlsContext } from '../contexts/ControlsContext';
import { useGameContext } from '../contexts/GameContext';
import { MapLocation } from '../map/MapLocation';
import { GameEntityIcon } from './GameEntityIcon';

export const GameMapEntity: FunctionComponent<
	{
		entity: EcsEntity<typeof locationComponent | typeof visibilityComponent>;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ entity, ...rest }) => {
	const { state, selectEntity } = useControlsContext();

	const isSelected = state.selectedEntity === entity;

	const contextMenu = useMapTileContextMenu();

	const game = useGameContext();

	const onRmb = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			const tile = game.terrain.getTileEqualToLocation(entity.location.get());
			if (!tile) {
				throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
			}
			contextMenu.open(event, { tile });
		},
		[contextMenu],
	);

	const [x, y] = useEventedValue(entity.location);

	return (
		<MapLocation
			x={x}
			y={y}
			onClick={() => selectEntity(entity)}
			onContextMenu={onRmb}
			{...rest}
		>
			<div style={{ fontSize: `${entity.iconSize}em` }}>
				<GameEntityIcon entity={entity} />
			</div>
		</MapLocation>
	);
};
