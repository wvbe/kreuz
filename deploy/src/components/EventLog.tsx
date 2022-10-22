import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { DestroyerFn, PersonEntity, PERSON_NEEDS, type Game } from '@lib';
import { Table, Row, Cell } from './atoms/Table.tsx';
type Log = {
	id: number;
	time: number;
	message: string;
};

function setLogListeners(game: Game, log: (msg: string) => void): DestroyerFn {
	const destroyers: DestroyerFn[] = [
		game.$start.on(() => log(`Game has started`)),
		game.$stop.on(() => log(`Game has stopped`)),
		game.entities.$add.on((added) => {
			log(`${added.length} new entities were added to the game`);
		}),
		game.entities.$remove.on((removed) =>
			log(`${removed.length} new entities were removed from the game`),
		),
	];

	setTimeout(() => {
		log('Derp derp!');
	}, 1000);
	return () => {
		destroyers.forEach((d) => d());
	};
}

export const EventLog: FunctionComponent<{ game: Game }> = ({ game }) => {
	const [logs, setLogs] = useState<Log[]>([]);
	const messageId = useRef(0);
	useEffect(() => {
		return setLogListeners(game, (message: string) => {
			logs.unshift({ id: messageId.current++, time: game.time.now, message });
			setLogs(logs.slice());
		});
	}, []);
	return (
		<Table>
			{logs.map(({ time, message, id }) => (
				<Row key={id}>
					<Cell>{time}</Cell>
					<Cell>{message}</Cell>
				</Row>
			))}
		</Table>
	);
};
