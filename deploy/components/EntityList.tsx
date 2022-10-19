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
					entity.label.substring(2)
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
				<tr key={i} onClick={() => setSelected(entity)}>
					<td>{entity.type}</td>
					<th>{entity.label}</th>
					<td>{entity.$$job.get()?.label}</td>
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
