import { generator as createGame } from '@lib';
import { type Game } from '@lib';
import { useEffect, useState } from 'react';

import { GameUI } from '~/src/components/GameUI.tsx';
import { AlephDriver } from '~/src/utils/AlephDriver.ts';

export default function Index() {
	const [game, setGame] = useState<null | Game>(null);
	const [driver, setDriver] = useState<null | AlephDriver>(null);
	useEffect(() => {
		const t = setTimeout(() => {
			const { driver, game } = createGame(new AlephDriver());
			driver.start();
			self.driver = driver;
			setGame(game);
			setDriver(driver as AlephDriver);
		}, 10);

		return () => {
			// @TODO Run driver.detach() and stuff
			clearTimeout(t);
		};
	}, []);
	if (!game || !driver) {
		return <p>Generating game, please give it a second</p>;
	}
	return <GameUI game={game} driver={driver} />;
}
