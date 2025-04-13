import React, { FunctionComponent, useMemo } from 'react';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { Collection } from '../../lib/level-1/events/Collection';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow';
import { Cell, Row, Table } from '../components/atoms/Table';
import { useCollection } from '../hooks/useEventedValue';
import { useSelectedEntity } from '../hooks/useSelectedEntity';
import { EntityBadge } from './EntityBadge';

export const EntityList: FunctionComponent<{
	label: string;
	entities: Collection<EcsEntity<any>>;
}> = ({ label, entities, filter }) => {
	const selectedEntity = useSelectedEntity();
	const _items = useCollection(entities);
	const items = useMemo(
		() =>
			_items.map((entity, i) => (
				<Row key={entity.id} onClick={() => selectedEntity.set(entity)}>
					<Cell>
						<EntityBadge entity={entity} />
					</Cell>
				</Row>
			)),
		[_items],
	);

	return (
		<CollapsibleWindow label={label} initiallyOpened>
			<Table>{items}</Table>
		</CollapsibleWindow>
	);
};
