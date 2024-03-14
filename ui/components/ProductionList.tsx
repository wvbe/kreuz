import { Blueprint, Event } from '@lib';
import React, {
	FunctionComponent,
	MouseEventHandler,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useGameContext } from '../context/GameContext.tsx';
import { useCollection } from '../hooks/useEventedValue.ts';
import { useNavigation } from '../hooks/useNavigation.ts';
import { ROUTE_PRODUCTION_DETAILS } from '../routes/ROUTES.ts';
import { Badge } from './atoms/Badge.tsx';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { EcsEntity } from '@lib';
import { productionComponent } from '@lib';

function getTotalDelta(entities: EcsEntity<typeof productionComponent>[]) {
	return entities.reduce((total, entity) => (total += entity.$$progress.delta), 0);
}

function getTotalWorkers(entities: EcsEntity<typeof productionComponent>[]): number {
	return entities.reduce((total, factory) => total + factory.$workers.length, 0);
}
const ProductionSummary: FunctionComponent<{
	blueprint: Blueprint;
	entities: EcsEntity<typeof productionComponent>[];
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
	const onClick = useCallback<MouseEventHandler<HTMLTableRowElement>>((event) => {
		event.preventDefault();
		event.stopPropagation();
		navigate(ROUTE_PRODUCTION_DETAILS, {
			blueprintId: game.assets.blueprints.key(blueprint),
		});
	}, []);

	const [workerCount, setWorkerCount] = useState(getTotalWorkers(entities));
	useEffect(() => {
		const destroyers = entities.map((factory) => {
			return factory.$workers.$change.on(() => {
				setWorkerCount(getTotalWorkers(entities));
			});
		});
		return () => {
			destroyers.forEach((d) => d());
		};
	}, [entities]);
	const hoursPerCycle = totalDelta * 1000 * 24;
	return (
		<Row onClick={onClick}>
			<Cell>
				<Badge
					title={blueprint.name}
					subtitle={
						<>
							Producing{' '}
							<PopOnUpdateSpan>{`${
								hoursPerCycle === Infinity ? '∞' : hoursPerCycle.toFixed(1)
							}/day`}</PopOnUpdateSpan>
						</>
					}
					icon={blueprint.products[0]?.material.symbol}
				/>
			</Cell>
			<Cell>
				<PopOnUpdateSpan>{entities.length} factories</PopOnUpdateSpan>
			</Cell>
			<Cell>
				<PopOnUpdateSpan>{workerCount} workers</PopOnUpdateSpan>
			</Cell>
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
				.reduce<Record<string, EcsEntity<typeof productionComponent>[]>>(
					(entitiesByBlueprint, blueprint) => {
						const key = game.assets.blueprints.key(blueprint);
						entitiesByBlueprint[key] = game.entities.filter(
							(entity) =>
								(entity as EcsEntity<typeof productionComponent>).$blueprint?.get() === blueprint,
						);
						return entitiesByBlueprint;
					},
					{},
				),
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
