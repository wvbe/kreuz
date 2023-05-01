import { type DestroyerFn, type Game, type DriverI } from '@lib';
import React, { type FunctionComponent, useEffect, useRef, useState } from 'react';
import { Cell, Row, Table } from './atoms/Table.tsx';

type Log = {
	id: number;
	time: number;
	message: string;
};

function setLogListeners(game: Game, driver: DriverI, log: (msg: string) => void): DestroyerFn {
	let wasStoppedOnce = false;
	const destroyers: DestroyerFn[] = [
		driver.$resume.on(() => {
			log(`Game has ${wasStoppedOnce ? 'resumed' : 'started'}`);
		}),
		driver.$pause.on(() => {
			wasStoppedOnce = true;
			log(`Game has paused`);
		}),
		game.entities.$add.on((added) => {
			log(`${added.length} new entities were added to the game`);
		}),
		game.entities.$remove.on((removed) =>
			log(`${removed.length} new entities were removed from the game`),
		),
	];

	return () => {
		destroyers.forEach((d) => d());
	};
}

export const EventLog: FunctionComponent<{ game: Game; driver: DriverI }> = ({ game, driver }) => {
	const [logs, setLogs] = useState<Log[]>([]);
	const messageId = useRef(0);
	useEffect(() => {
		return setLogListeners(game, driver, (message: string) => {
			logs.unshift({ id: messageId.current++, time: game.time.now, message });
			setLogs(logs.slice());
		});
	}, [game, driver]);
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
