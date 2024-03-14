import { Collection, CoordinateI, EcsEntity, EventedValue, FilterFn } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { PopOnUpdateSpan } from '../components/atoms/PopOnUpdateSpan.tsx';
import { Cell, Row, Table } from '../components/atoms/Table.tsx';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';
import { EntityBadge } from './EntityBadge.tsx';

const EntityLocationPhrase: FunctionComponent<{ location: EventedValue<CoordinateI> }> = ({
	location,
}) => {
	const { x, y } = useEventedValue(location);
	return <PopOnUpdateSpan>{`(${y.toFixed(2)}, ${x.toFixed(2)})`}</PopOnUpdateSpan>;
};

export const EntityList: FunctionComponent<{
	label: string;
	entities: Collection<EcsEntity<any>>;
	filter: FilterFn<EcsEntity<any>>;
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
		<CollapsibleWindow label={label} initiallyOpened>
			<Table>{items}</Table>
		</CollapsibleWindow>
	);
};
