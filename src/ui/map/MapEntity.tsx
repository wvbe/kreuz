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
import { useMapTileContextMenu } from '../context-menu/MAP_TILE_CONTEXT_MENU';
import { useGameContext } from '../context/GameContext';
import { useEventedValue } from '../hooks/useEventedValue';
import { useSelectedEntity } from '../hooks/useSelectedEntity';

export const MapEntity: FunctionComponent<
	{
		entity: EcsEntity<typeof locationComponent | typeof visibilityComponent>;
		zoom: number;
	} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ entity, zoom, ...rest }) => {
	const selectedEntity = useSelectedEntity();
	const isSelected = selectedEntity.current === entity;
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
		<div
			className={`meta--emoji-symbols map-entity ${isSelected ? `map-entity--selected` : ''}`}
			onClick={() => selectedEntity.set(entity)}
			onContextMenu={onRmb}
			style={{ top: `${y * zoom}px`, left: `${x * zoom}px` }}
			{...rest}
		>
			{entity.icon}
		</div>
	);
};
