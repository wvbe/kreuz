import React, { FunctionComponent, useMemo } from 'react';
import { blueprints } from '@lib';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { InventoryBag } from '../inventory/InventoryUI.tsx';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { useNavigation } from '../hooks/useNavigation.ts';
import { useGameContext } from '../context/GameContext.tsx';
import { ROUTE_PRODUCTION_DETAILS } from '../routes/ROUTES.ts';

export const BlueprintList: FunctionComponent = () => {
	const navigate = useNavigation();
	const game = useGameContext();
	const items = useMemo(
		() =>
			game.assets.blueprints.list().map((blueprint, i) => (
				<Row
					key={i}
					onClick={() =>
						navigate(ROUTE_PRODUCTION_DETAILS, {
							blueprintId: game.assets.blueprints.key(blueprint),
						})
					}
				>
					<Cell>{blueprint.name}</Cell>
					<Cell>{(1000 / blueprint.options.fullTimeEquivalent).toFixed(1)}/hour</Cell>
					<Cell>{(blueprint.options.fullTimeEquivalent / 1000).toFixed(1)} h/c</Cell>
					<Cell>
						<InventoryBag stacks={blueprint.products} />
					</Cell>
				</Row>
			)),
		[game],
	);
	return (
		<CollapsibleWindow label={`Blueprints`} initiallyOpened>
			<Table>{items}</Table>
		</CollapsibleWindow>
	);
};
