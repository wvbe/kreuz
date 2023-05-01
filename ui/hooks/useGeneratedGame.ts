import { type Game, type DriverI, generator as createGame } from '@lib';
import { useEffect, useState } from 'react';

export function useGeneratedGame(driver: DriverI): null | Game {
	const [game, setGame] = useState<null | Game>(null);
	useEffect(() => {
		const t = setTimeout(() => {
			const { game } = createGame(driver);
			driver.start();
			(self as any).driver = driver;
			setGame(game);
		}, 10);

		return () => {
			// @TODO Run driver.detach() and stuff
			driver.detach();
			clearTimeout(t);
		};
	}, []);

	return game;
}
