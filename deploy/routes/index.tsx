import { GameUI } from '~/components/GameUI.tsx';

import createGame from '@demo/generator.ts';
import { useEffect, useMemo, useState } from 'react';
import { AlephDriver } from '../utils/AlephDriver.ts';

export default function Index() {
	const [game, setGame] = useState<null | Game>(null);
	useEffect(() => {
		const t = setTimeout(() => {
			const { driver, game } = createGame(new AlephDriver());
			driver.start();
			self.driver = driver;
			setGame(game);
		}, 10);

		return () => clearTimeout(t);
	}, []);
	if (!game) {
		return <p>Generating game, please give it a second</p>;
	}
	return <GameUI game={game} />;
}
