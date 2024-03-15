import { Collection, EcsEntity, FilterFn } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { Cell, Row, Table } from '../components/atoms/Table.tsx';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';
import { EntityBadge } from './EntityBadge.tsx';

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
