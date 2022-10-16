import {
	Collection,
	CoordinateI,
	EntityI,
	EventedValue,
	PersonEntity,
	SettlementEntity,
} from '@lib';
import { FunctionComponent, useMemo, useState } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { PersonEntityDetails } from './PersonEntityDetails.tsx';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { Badge } from './atoms/Badge.tsx';

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
	} else {
		return <PersonEntityDetails entity={entity as PersonEntity} />;
	}
};

export const EntityList: FunctionComponent<{ entities: Collection<EntityI> }> = ({ entities }) => {
	const [selected, setSelected] = useState<EntityI | undefined>(undefined);

	const items = useMemo(
		() =>
			entities.map((entity, i) => (
				<tr key={i} onClick={() => setSelected(entity)}>
					<td>{entity.type}</td>
					<th>{entity.label}</th>
					<td>{entity.job?.label}</td>
					<td>
						<EntityLocationPhrase location={entity.$$location} />
					</td>
				</tr>
			)),
		[],
	);

	return (
		<>
			<EntityDetails entity={selected} />
			<table>
				<tbody>{items}</tbody>
			</table>
		</>
	);
};
