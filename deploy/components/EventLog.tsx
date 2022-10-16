import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { PersonEntity, PERSON_NEEDS, type Game } from '@lib';

type Log = {
	id: number;
	time: number;
	message: string;
};

function setLogListeners(game: Game, log: (msg: string) => void) {
	game.$start.on(() => log(`Game has started`));
	game.$stop.on(() => log(`Game has stopped`));
	game.entities
		.filter<PersonEntity>((e) => e instanceof PersonEntity)
		.forEach(setLogForPersonEntity);

	// game.entities.$add.on((added) => {
	// 	log(`${added.length} new entities were added to the game`);
	// 	added
	// 		.filter((e): e is PersonEntity => e instanceof PersonEntity)
	// 		.forEach(setLogForPersonEntity);
	// });
	game.entities.$remove.on((removed) =>
		log(`${removed.length} new entities were removed from the game`),
	);

	function setLogForPersonEntity(person: PersonEntity) {
		PERSON_NEEDS.forEach((need) => {
			need.moods.reduce((min, { upUntil: max, label }) => {
				if (!label) {
					return max;
				}
				person.needs[need.id].onBetween(min, max, () => log(`${person.label} is ${label}.`));
				return max;
			}, 0);
		});
	}
}

export const EventLog: FunctionComponent<{ game: Game }> = ({ game }) => {
	const [logs, setLogs] = useState<Log[]>([]);

	const messageId = useRef(0);
	useEffect(() => {
		setLogListeners(game, (message: string) => {
			console.log('--> ' + message);
			logs.unshift({ id: messageId.current++, time: game.time.now, message });
			setLogs(logs.slice());
		});
	}, []);
	return (
		<div className="game-ui">
			<ol>
				{logs.map(({ time, message, id }) => (
					<li key={id}>
						{time}, {message}
					</li>
				))}
			</ol>
		</div>
	);
};
