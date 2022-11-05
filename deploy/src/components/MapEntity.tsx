import { EntityI } from '@lib';
import { DetailedHTMLProps, FunctionComponent, HTMLAttributes } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { setSelectedEntity, useIsSelectedEntity } from '../hooks/useSelectedEntity.ts';

export const MapEntity: FunctionComponent<
	{ entity: EntityI; zoom: number } & DetailedHTMLProps<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>
> = ({ entity, zoom, ...rest }) => {
	const isSelected = useIsSelectedEntity(entity);
	const { x, y } = useEventedValue(entity.$$location);
	return (
		<div
			className={`map-entity map-entity--${entity.type} ${
				isSelected ? `map-entity--selected` : ''
			}`}
			onClick={() => setSelectedEntity(entity)}
			style={{ top: `${y * zoom}px`, left: `${x * zoom}px` }}
			{...rest}
		>
			{entity.icon}
		</div>
	);
};
