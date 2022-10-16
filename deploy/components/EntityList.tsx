import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { CoordinateI, EntityI, EventedValue, PersonEntity, SettlementEntity } from '@lib';
import { FillBar } from './FillBar.tsx';
import { Need } from '../library/src/entities/Need.ts';
import { PopOnUpdateSpan } from './PopOnUpdateSpan.tsx';

const EntityLocationPhrase: FunctionComponent<{ location: EventedValue<CoordinateI> }> = ({
	location,
}) => {
	const { x, y } = useEventedValue(location);
	return <PopOnUpdateSpan text={`Lat:${y.toFixed(2)} Lng:${x.toFixed(2)}`} />;
};

const PersonEntityNeed: FunctionComponent<{ need: Need }> = ({ need }) => {
	useEffect(() => need.setPollingInterval(100), [need]);
	const value = useEventedValue(need);
	return <FillBar ratio={value} label={need.label} />;
};

const PersonEntityDetails: FunctionComponent<{ entity: PersonEntity }> = ({ entity }) => {
	const needs = useMemo(
		() => entity.needsList.map((need, index) => <PersonEntityNeed key={index} need={need} />),
		[entity],
	);
	return (
		<div>
			<h1>{entity?.label}</h1>
			{needs}
		</div>
	);
};

const SettlementEntityDetails: FunctionComponent<{ entity: SettlementEntity }> = ({ entity }) => {};

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

export const EntityList: FunctionComponent<{ entities: EntityI[] }> = ({ entities }) => {
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
