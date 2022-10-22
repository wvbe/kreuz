import { Collection, CoordinateI, EntityI, EventedValue } from '@lib';
import { FunctionComponent, useMemo } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { setSelectedEntity } from '../hooks/useSelectedEntity.ts';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { EntityBadge } from './EntityBadge.tsx';

const EntityLocationPhrase: FunctionComponent<{ location: EventedValue<CoordinateI> }> = ({
	location,
}) => {
	const { x, y } = useEventedValue(location);
	return <PopOnUpdateSpan text={`Lat:${y.toFixed(2)} Lng:${x.toFixed(2)}`} />;
};
export const EntityList: FunctionComponent<{ entities: Collection<EntityI> }> = ({ entities }) => {
	const items = useMemo(
		() =>
			entities.map((entity, i) => (
				<Row key={i} onClick={() => setSelectedEntity(entity)}>
					<Cell>
						<EntityBadge entity={entity} />
					</Cell>
					<Cell>
						<EntityLocationPhrase location={entity.$$location} />
					</Cell>
				</Row>
			)),
		[],
	);

	return <Table>{items}</Table>;
};
