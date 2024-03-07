import { type Game, type DriverI, generator as createGame } from '@lib';
import { useEffect, useState } from 'react';

export function useGeneratedGame(driver: DriverI): null | Game {
	const [game, setGame] = useState<null | Game>(null);
	useEffect(() => {
		const timeout = setTimeout(async () => {
			const { game } = await createGame(driver);
			await driver.start();
			(self as any).driver = driver;
			setGame(game);
		}, 10);

		return () => {
			clearTimeout(timeout);
			void driver.detach();
		};
	}, []);

	return game;
}
