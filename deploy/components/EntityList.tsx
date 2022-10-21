import {
	Collection,
	CoordinateI,
	EntityI,
	EventedValue,
	FactoryBuildingEntity,
	PersonEntity,
	SettlementEntity,
} from '@lib';
import { FunctionComponent, useMemo, useState } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { PersonEntityDetails } from './PersonEntityDetails.tsx';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { Badge } from './atoms/Badge.tsx';
import { FactoryBuildingEntityDetails } from './FactoryBuildingEntityDetails.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';

const EntityLocationPhrase: FunctionComponent<{ location: EventedValue<CoordinateI> }> = ({
	location,
}) => {
	const { x, y } = useEventedValue(location);
	return <PopOnUpdateSpan text={`Lat:${y.toFixed(2)} Lng:${x.toFixed(2)}`} />;
};

const SettlementEntityDetails: FunctionComponent<{ entity: SettlementEntity }> = ({ entity }) => {
	return <Badge icon={entity.icon} title={entity.parameters.name} subtitle={entity.title} />;
};

const EntityDetails: FunctionComponent<{ entity?: EntityI }> = ({ entity }) => {
	if (!entity) {
		return <p>No selection</p>;
	}
	if (entity.type === 'settlement') {
		return <SettlementEntityDetails entity={entity as SettlementEntity} />;
	} else if (entity.type === 'person') {
		return <PersonEntityDetails entity={entity as PersonEntity} />;
	} else if (entity.type === 'factory') {
		return <FactoryBuildingEntityDetails entity={entity as FactoryBuildingEntity} />;
	} else {
		return (
			<Badge
				icon={entity.icon}
				title={
					// Snip off the customary emoji
					entity.name
				}
				subtitle={entity.title}
			/>
		);
	}
};

export const EntityList: FunctionComponent<{ entities: Collection<EntityI> }> = ({ entities }) => {
	const [selected, setSelected] = useState<EntityI | undefined>(undefined);

	const items = useMemo(
		() =>
			entities.map((entity, i) => (
				<Row key={i} onClick={() => setSelected(entity)}>
					<Cell>{entity.type}</Cell>
					<Cell>{entity.label}</Cell>
					<Cell>{entity.title}</Cell>
					<Cell>
						<EntityLocationPhrase location={entity.$$location} />
					</Cell>
				</Row>
			)),
		[],
	);

	return (
		<>
			<EntityDetails entity={selected} />
			<Table>{items}</Table>
		</>
	);
};
