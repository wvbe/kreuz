import { Collection, CoordinateI, EntityI, EventedValue, FilterFn } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { PopOnUpdateSpan } from '../components/atoms/PopOnUpdateSpan.tsx';
import { Cell, Row, Table } from '../components/atoms/Table.tsx';
import { EntityBadge } from './EntityBadge.tsx';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';

const EntityLocationPhrase: FunctionComponent<{ location: EventedValue<CoordinateI> }> = ({
	location,
}) => {
	const { x, y } = useEventedValue(location);
	return <PopOnUpdateSpan>{`Lat:${y.toFixed(2)} Lng:${x.toFixed(2)}`}</PopOnUpdateSpan>;
};

export const EntityList: FunctionComponent<{
	label: string;
	entities: Collection<EntityI>;
	filter: FilterFn<EntityI>;
}> = ({ label, entities, filter }) => {
	const selectedEntity = useSelectedEntity();
	const items = useMemo(
		() =>
			entities.filter(filter).map((entity, i) => (
				<Row key={entity.id} onClick={() => selectedEntity.set(entity)}>
					<Cell>
						<EntityBadge entity={entity} />
					</Cell>
					<Cell>
						<EntityLocationPhrase location={entity.$$location} />
					</Cell>
				</Row>
			)),
		[filter],
	);

	return (
		<CollapsibleWindow label={label}>
			<Table>{items}</Table>
		</CollapsibleWindow>
	);
};
