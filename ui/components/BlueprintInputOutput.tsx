import { Blueprint } from '@lib';
import React, { FunctionComponent, MouseEventHandler } from 'react';
import { InventoryBag } from '../inventory/InventoryUI.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';

export const BlueprintInputOutput: FunctionComponent<{
	blueprint: Blueprint | null;
	onClick?: MouseEventHandler<HTMLTableRowElement>;
}> = ({ blueprint, onClick }) => {
	if (!blueprint) {
		return null;
	}
	return (
		<Table>
			<Row onClick={onClick}>
				<Cell style={{ border: '1px solid #999999', borderRadius: '6px' }}>
					{blueprint.ingredients.length ? (
						<InventoryBag stacks={blueprint.ingredients} />
					) : (
						<i>None</i>
					)}
				</Cell>
				<Cell style={{ textAlign: 'center' }}>
					{(blueprint.options.fullTimeEquivalent / 1000).toFixed(1)} hours
					<br />
					<svg xmlns="http://www.w3.org/2000/svg" width="80" height="29">
						<path d="m0,0h80v29H0" fill="none" />
						<path d="m61,15H11v-1h49m0-2 9,2.5-9,2.5" />
					</svg>
				</Cell>
				<Cell style={{ border: '1px solid #999999', borderRadius: '6px' }}>
					<InventoryBag stacks={blueprint.products} />
				</Cell>
			</Row>
		</Table>
	);
};
