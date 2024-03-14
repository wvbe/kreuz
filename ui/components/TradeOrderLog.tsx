import { EcsEntity, type Collection, type TradeOrder } from '@lib';
import React, { type FunctionComponent } from 'react';
import { useCollection } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { Table } from './atoms/Table.tsx';
import { TokenizedText } from './atoms/TokenizedText.tsx';

export const TradeOrderLog: FunctionComponent<{
	entity: EcsEntity;
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
