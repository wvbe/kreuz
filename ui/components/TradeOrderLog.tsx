import React, { useMemo, type FunctionComponent } from 'react';
import { type Collection, type TradeOrder, type MaterialState, type PersonEntity } from '@lib';
import { useCollection } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { TokenizedText } from './atoms/TokenizedText.tsx';

export const TradeOrderLog: FunctionComponent<{
	entity: PersonEntity;
	log: Collection<TradeOrder>;
}> = ({ entity, log }) => {
	const items = useCollection(log);

	return (
		<CollapsibleWindow label="Trade orders" initiallyOpened>
			<Table>
				{items.length ? (
					items.map((trade, i) => (
						<p>
							<TokenizedText text={trade.getSummaryForOwner(entity)} />
						</p>
					))
				) : (
					<p>No trades yet</p>
				)}
			</Table>
		</CollapsibleWindow>
	);
};
