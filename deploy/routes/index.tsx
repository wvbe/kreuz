import { GameUI } from '~/components/GameUI.tsx';

import createBasementGame from '@demo/basement.ts';
import createGeneratedGame from '@demo/generator.ts';
import { useEffect, useMemo, useState } from 'react';
import { AlephDriver } from '../utils/AlephDriver.ts';

export default function Index() {
	const [driver, setDriver] = useState<null | AlephDriver>(null);
	useEffect(() => {
		const t = setTimeout(() => {
			const driver = new AlephDriver(createGeneratedGame());
			driver.attach(driver.game).start();
			self.driver = driver;
			setDriver(driver);
		}, 10);

		return () => clearTimeout(t);
	}, []);
	if (!driver) {
		return <p>Generating game, please give it a second</p>;
	}
	return <GameUI driver={driver} />;
}
