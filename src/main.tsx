import { FunctionComponent, default as React, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useGeneratedGame } from './ui/hooks/useGeneratedGame';
import { BrowserDriver } from './ui2/game/BrowserDriver';

// import { caveScene } from './scenarios/cave';

import basement from './scenarios/basement';
import { Ui } from './ui2/Ui';

const driver = new BrowserDriver();

const App: FunctionComponent = () => {
	const game = useGeneratedGame(basement, driver);
	if (!game) {
		return <p className='panel please-wait'>Please wait…</p>;
	}
	console.log(game);

	return <Ui game={game} driver={driver} />;
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
