import { useEffect, useState } from 'react';
import { DriverI } from 'src/lib/level-1/drivers/types';
import Game from 'src/lib/level-1/Game';

export function useGeneratedGame(
	factory: (driver: DriverI) => Promise<Game>,
	driver: DriverI,
): null | Game {
	const [game, setGame] = useState<null | Game>(null);
	useEffect(() => {
		const timeout = setTimeout(async () => {
			const game = await factory(driver);
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
