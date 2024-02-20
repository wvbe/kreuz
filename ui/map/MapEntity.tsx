import { EntityI } from '@lib';
import React, {
	DetailedHTMLProps,
	FunctionComponent,
	HTMLAttributes,
	MouseEventHandler,
	useCallback,
} from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { setSelectedEntity, useIsSelectedEntity } from '../hooks/useSelectedEntity.ts';
import { useMapTileContextMenu } from './mapTileContextMenu.ts';
import { useGameContext } from '../context/GameContext.tsx';

export const MapEntity: FunctionComponent<
	{ entity: EntityI; zoom: number } & DetailedHTMLProps<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>
> = ({ entity, zoom, ...rest }) => {
	const isSelected = useIsSelectedEntity(entity);
	const contextMenu = useMapTileContextMenu();
	const game = useGameContext();
	const onRmb = useCallback<MouseEventHandler<HTMLDivElement>>(
		(event) => {
			const tile = game.terrain.getTileEqualToLocation(entity.$$location.get());
			contextMenu.open(event, { tile, entity });
		},
		[contextMenu],
	);

	const { x, y } = useEventedValue(entity.$$location);
	return (
		<div
			className={`meta--emoji-symbols map-entity map-entity--${entity.type} ${
				isSelected ? `map-entity--selected` : ''
			}`}
			onClick={() => setSelectedEntity(entity)}
			onContextMenu={onRmb}
			style={{ top: `${y * zoom}px`, left: `${x * zoom}px` }}
			{...rest}
		>
			{entity.icon}
		</div>
	);
};
