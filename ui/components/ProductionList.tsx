import { Blueprint, EntityI, Event, FactoryBuildingEntity, Game } from '@lib';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useCollection } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { useGameContext } from '../context/GameContext.tsx';
// import { LineGraph } from './LineGraph.tsx';

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
				<PopOnUpdateSpan>{`${
					hoursPerCycle === Infinity ? '∞' : hoursPerCycle.toFixed(1)
				}/day`}</PopOnUpdateSpan>
			</Cell>
		</Row>
	);
};

export const ProductionList: FunctionComponent = () => {
	const game = useGameContext();
	const entities = useCollection(game.entities);
	const entitiesByBlueprint = useMemo(() => {
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

		return entitiesByBlueprint;
	}, [entities]);

	const products = useMemo(() => {
		return Object.values(entitiesByBlueprint).map((entities, i) => (
			<ProductionSummary
				key={i}
				blueprint={entities[0].$blueprint.get() as Blueprint}
				entities={entities}
			/>
		));
	}, [entitiesByBlueprint]);

	// const subscriptions = useMemo(
	// 	() =>
	// 		Object.values(entitiesByBlueprint).map((entities) => {
	// 			return () => getTotalDelta(entities);
	// 		}),
	// 	[entitiesByBlueprint],
	// );

	return (
		<>
			{/* <LineGraph subscriptions={subscriptions} /> */}
			<CollapsibleWindow label={`World production panel`}>
				<Table>{products}</Table>
			</CollapsibleWindow>
		</>
	);
};
