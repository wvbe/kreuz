import React, {
	FunctionComponent,
	MouseEventHandler,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { byEcsComponents } from 'src/lib/level-1/ecs/assert';
import { productionComponent } from 'src/lib/level-1/ecs/components/productionComponent';
import { Blueprint } from 'src/lib/level-1/ecs/components/productionComponent/Blueprint';
import { EcsEntity } from 'src/lib/level-1/ecs/types';
import { useGameContext } from '../context/GameContext';
import { useCollection } from '../hooks/useEventedValue';
import { ROUTE_PRODUCTION_DETAILS } from '../routes/ROUTES';
import { Badge } from './atoms/Badge';
import { CollapsibleWindow } from './atoms/CollapsibleWindow';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan';
import { Row, Cell, Table } from './atoms/Table';

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
				.toArray()
				.reduce<
					Record<string, EcsEntity<typeof productionComponent>[]>
				>((entitiesByBlueprint, blueprint) => {
					const key = game.assets.blueprints.key(blueprint);
					entitiesByBlueprint[key] = game.entities
						.filter(byEcsComponents([productionComponent]))
						.filter((entity) => entity.blueprint?.get() === blueprint);
					return entitiesByBlueprint;
				}, {}),
		[entities],
	);

	const products = useMemo(() => {
		return Object.entries(entitiesByBlueprint).map(([key, entities], i) => (
			<ProductionSummary
				key={i}
				blueprint={game.assets.blueprints.get(key)!}
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
