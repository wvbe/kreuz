import { Blueprint, Event, FactoryBuildingEntity } from '@lib';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useGameContext } from '../context/GameContext.tsx';
import { useCollection } from '../hooks/useEventedValue.ts';
import { useNavigation } from '../hooks/useNavigation.ts';
import { ROUTE_PRODUCTION_DETAILS } from '../routes/ROUTES.ts';
import { Badge } from './atoms/Badge.tsx';
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
	const navigate = useNavigation();
	const game = useGameContext();
	const [totalDelta, setTotalDelta] = useState(getTotalDelta(entities));
	useEffect(
		() =>
			Event.onAny(
				() => setTotalDelta(getTotalDelta(entities)),
				entities.map((factory) => factory.$$progress.$recalibrate),
			),
		[entities],
	);
	const onClick = useCallback(
		() =>
			navigate(ROUTE_PRODUCTION_DETAILS, {
				blueprintId: game.assets.blueprints.key(blueprint),
			}),
		[],
	);
	const hoursPerCycle = totalDelta * 1000 * 24;
	return (
		<Row onClick={onClick}>
			<Cell>
				<Badge
					title={blueprint.name}
					subtitle={
						<PopOnUpdateSpan>{`${
							hoursPerCycle === Infinity ? '∞' : hoursPerCycle.toFixed(1)
						}/day`}</PopOnUpdateSpan>
					}
					icon={blueprint.products[0]?.material.symbol}
				/>
			</Cell>
			<Cell>{entities.length} factories</Cell>
		</Row>
	);
};

export const ProductionList: FunctionComponent = () => {
	const game = useGameContext();
	const entities = useCollection(game.entities);
	const entitiesByBlueprint = useMemo(
		() =>
			game.assets.blueprints
				.list()
				.reduce<Record<string, FactoryBuildingEntity[]>>((entitiesByBlueprint, blueprint) => {
					const key = game.assets.blueprints.key(blueprint);
					entitiesByBlueprint[key] = game.entities.filter(
						(entity) => (entity as FactoryBuildingEntity).$blueprint?.get() === blueprint,
					);
					return entitiesByBlueprint;
				}, {}),
		[entities],
	);

	const products = useMemo(() => {
		return Object.entries(entitiesByBlueprint).map(([key, entities], i) => (
			<ProductionSummary
				key={i}
				blueprint={game.assets.blueprints.item(key)!}
				entities={entities}
			/>
		));
	}, [entitiesByBlueprint]);

	return (
		<>
			{/* <LineGraph subscriptions={subscriptions} /> */}
			<CollapsibleWindow label={`World production panel`} initiallyOpened>
				<Table>{products}</Table>
			</CollapsibleWindow>
		</>
	);
};
