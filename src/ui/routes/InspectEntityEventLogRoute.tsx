import React, { useMemo, type FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import { useCollection } from '../hooks/useEventedValue';
import { eventLogComponent } from 'src/lib/level-1/ecs/components/eventLogComponent';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow';
import { Table, Row, Cell } from '../components/atoms/Table';
import { TokenizedText } from '../components/atoms/TokenizedText';
import { useGameContext } from '../context/GameContext';

export const InspectEntityEventLogRoute: FunctionComponent = () => {
	const { entityId } = useParams<{ entityId: string }>();
	const game = useGameContext();
	const entity = useMemo(() => game.entities.getByKey(entityId!), [entityId]);
	if (!entity || !eventLogComponent.test(entity)) {
		return null;
	}

	const items = useCollection(entity.events);

	return (
		<CollapsibleWindow label='Log' initiallyOpened>
			<Table>
				{items.length ? (
					items
						.reduce(
							(arr, message, index) => {
								if (arr[arr.length - 1]?.message === message) {
									arr[arr.length - 1].count++;
								} else {
									arr.push({ message, count: 1 });
								}
								return arr;
							},
							[] as { message: string; count: number }[],
						)
						.reverse()
						.map(({ message, count }, i) => (
							<Row key={i}>
								<Cell>{count > 1 ? `${count}×` : null}</Cell>
								<Cell>
									<p key={i}>
										<TokenizedText text={message} />
									</p>
								</Cell>
							</Row>
						))
				) : (
					<p>Nothing logged</p>
				)}
			</Table>
		</CollapsibleWindow>
	);
};
