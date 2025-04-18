import React, { FunctionComponent, useMemo } from 'react';
import { useGameContext } from '../../ui2/contexts/GameContext';
import { useNavigation } from '../hooks/useNavigation';
import { InventoryStack } from '../inventory/InventoryStack';
import { MoneyBag } from '../inventory/InventoryUI';
import { ROUTE_MATERIALS_DETAILS } from '../routes/ROUTES';
import { CollapsibleWindow } from './atoms/CollapsibleWindow';
import { Cell, Row, Table } from './atoms/Table';

export const MaterialList: FunctionComponent = () => {
	const navigate = useNavigation();
	const game = useGameContext();

	const items = useMemo(
		() =>
			game.assets.materials.toArray().map((material, i) => (
				<Row
					key={i}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						navigate(ROUTE_MATERIALS_DETAILS, {
							materialId: game.assets.materials.key(material),
						});
					}}
				>
					<Cell>{material.label}</Cell>
					<Cell>{material.symbol}</Cell>
					<Cell>{material.stack}/stack</Cell>
					<Cell>
						<InventoryStack material={material} quantity={material.stack} />
					</Cell>
					<Cell>
						<MoneyBag value={material.value} />
					</Cell>
				</Row>
			)),
		[],
	);
	return (
		<CollapsibleWindow label={`Materials panel`} initiallyOpened>
			<Table>{items}</Table>
		</CollapsibleWindow>
	);
};
