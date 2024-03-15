import { EcsEntity, locationComponent } from '@lib';
import React, {
	DetailedHTMLProps,
	FunctionComponent,
	HTMLAttributes,
	MouseEventHandler,
	useCallback,
} from 'react';
import { useGameContext } from '../context/GameContext.tsx';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';
import { useMapTileContextMenu } from './MAP_TILE_CONTEXT_MENU.ts';
import { visibilityComponent } from '@lib';

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
			const tile = game.terrain.getTileEqualToLocation(entity.$$location.get());
			contextMenu.open(event, { tile });
		},
		[contextMenu],
	);

	const { x, y } = useEventedValue(entity.$$location);
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
