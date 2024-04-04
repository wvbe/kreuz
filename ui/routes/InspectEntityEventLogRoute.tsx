import { EcsEntity, eventLogComponent, type Collection, type TradeOrder } from '@lib';
import React, { useMemo, type FunctionComponent } from 'react';
import { useCollection } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { Table } from '../components/atoms/Table.tsx';
import { TokenizedText } from '../components/atoms/TokenizedText.tsx';
import { useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext.tsx';

export const InspectEntityEventLogRoute: FunctionComponent = () => {
	const { entityId } = useParams<{ entityId: string }>();
	const game = useGameContext();
	const entity = useMemo(() => game.entities.getByKey(entityId!), [entityId]);
	if (!entity || !eventLogComponent.test(entity)) {
		return null;
	}

	const items = useCollection(entity.events);

	return (
		<CollapsibleWindow label="Log" initiallyOpened>
			<Table>
				{items.length ? (
					items
						.reduce<string[]>(
							(arr, item, index, all) => (item === all[index - 1] ? arr : [...arr, item]),
							[],
						)
						.reverse()
						.map((item, i) => (
							<p key={i}>
								<TokenizedText text={item} />
							</p>
						))
				) : (
					<p>Nothing logged</p>
				)}
			</Table>
		</CollapsibleWindow>
	);
};
