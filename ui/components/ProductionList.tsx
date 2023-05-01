import { Blueprint, EntityI, Event, FactoryBuildingEntity, Game } from '@lib';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useCollection } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';

function getTotalDelta(entities: FactoryBuildingEntity[]) {
	return entities.reduce((total, entity) => (total += entity.$$progress.delta), 0);
}

const ProductionSummary: FunctionComponent<{
	blueprint: Blueprint;
	entities: FactoryBuildingEntity[];
}> = ({ blueprint, entities }) => {
	const [totalDelta, setTotalDelta] = useState(getTotalDelta(entities));
	useEffect(
		() =>
			Event.onAny<[number]>(
				() => setTotalDelta(getTotalDelta(entities)),
				entities.map((factory) => factory.$$progress.$recalibrate),
			),
		[entities],
	);
	const hoursPerCycle = totalDelta * 1000 * 24;
	return (
		<Row>
			<Cell>{blueprint.name}</Cell>
			<Cell>
				<PopOnUpdateSpan
					text={`${hoursPerCycle === Infinity ? '∞' : hoursPerCycle.toFixed(1)}/day`}
				/>
			</Cell>
		</Row>
	);
};

export const ProductionList: FunctionComponent<{ game: Game }> = ({ game }) => {
	const entities = useCollection(game.entities);
	const products = useMemo(() => {
		const entitiesByBlueprint: Record<string, FactoryBuildingEntity[]> = {};
		entities
			.filter((e): e is FactoryBuildingEntity => e.type === 'factory')
			.forEach((factory) => {
				const blueprintName = factory.$blueprint.get()?.name;
				if (!blueprintName) {
					return;
				}
				if (!entitiesByBlueprint[blueprintName]) {
					entitiesByBlueprint[blueprintName] = [];
				}
				entitiesByBlueprint[blueprintName].push(factory);
			});

		return Object.values(entitiesByBlueprint).map((entities, i) => (
			<ProductionSummary
				key={i}
				blueprint={entities[0].$blueprint.get() as Blueprint}
				entities={entities}
			/>
		));
	}, [entities]);

	return (
		<CollapsibleWindow label={`World production panel`}>
			<Table>{products}</Table>
		</CollapsibleWindow>
	);
};
