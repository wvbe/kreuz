import React, { useMemo, type FunctionComponent } from 'react';
import { type Collection, type TradeOrder, type MaterialState } from '@lib';
import { useCollection } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';

function joinMaterialStates(states: MaterialState[]) {
	return states;
}

function input(money: number, states: MaterialState[]) {
	if (!money && !states.length) {
		return '-';
	}
	const parts = [];
	if (money) {
		parts.push(`💰 ${money.toFixed(2)}`);
	}
	if (states.length) {
		parts.push(states.map((s) => `${s.quantity}x${s.material}`).join(', '));
	}
	return parts.join(' + ');
}
export const TradeOrderLog: FunctionComponent<{ log: Collection<TradeOrder> }> = ({ log }) => {
	const items = useCollection(log);

	return (
		<CollapsibleWindow label="Trade orders" initiallyOpened>
			<Table>
				{items.map((trade, i) => {
					return (
						<Row key={i}>
							<Cell>{trade.owner1.label}</Cell>
							<Cell>{input(trade.money1, trade.stacks1)}</Cell>
							<Cell
								style={{
									borderLeft: '1px solid darkgrey',
									borderRight: '1px solid darkgrey',
								}}
							>
								{trade.timeFinalised}
							</Cell>
							<Cell>{trade.owner2.label}</Cell>
							<Cell>{input(trade.money2, trade.stacks2)}</Cell>
						</Row>
					);
				})}
			</Table>
		</CollapsibleWindow>
	);
};
