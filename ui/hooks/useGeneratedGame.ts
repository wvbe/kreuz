import { type Game, type DriverI } from '@lib';
import { main as createGame } from '@scenarios';
import { useEffect, useState } from 'react';

export function useGeneratedGame(driver: DriverI): null | Game {
	const [game, setGame] = useState<null | Game>(null);
	useEffect(() => {
		const timeout = setTimeout(async () => {
			const game = await createGame(driver);
			await driver.start();
			(self as any).game = game;
			(self as any).driver = driver;
			setGame(game);
		}, 10);

		return () => {
			clearTimeout(timeout);
			void driver.detach();
		};
	}, [driver]);

	return game;
}
