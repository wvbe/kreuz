import React, { FunctionComponent, useMemo } from 'react';
import { materials } from '@lib';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { InventoryStack } from '../inventory/InventoryStack.tsx';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { MoneyBag } from '../inventory/InventoryUI.tsx';
import { useNavigation } from '../hooks/useNavigation.ts';
import { useGameContext } from '../context/GameContext.tsx';
import { ROUTE_MATERIALS_DETAILS } from '../routes/ROUTES.ts';

const materialsList = Object.keys(materials).map((key) => materials[key as keyof typeof materials]);

export const MaterialList: FunctionComponent = () => {
	const navigate = useNavigation();
	const game = useGameContext();
	const items = useMemo(
		() =>
			materialsList.map((material, i) => (
				<Row
					key={i}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						navigate(ROUTE_MATERIALS_DETAILS, { materialId: game.assets.materials.key(material) })
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
