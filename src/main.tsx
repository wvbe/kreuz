import { FunctionComponent, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserDriver } from './ui/game/BrowserDriver';
import { useGeneratedGame } from './ui/hooks/useGeneratedGame';

// import { caveScene } from './scenarios/cave';

import basement from './scenarios/basement';
import { Ui } from './ui/Ui';

const driver = new BrowserDriver();

const App: FunctionComponent = () => {
	const game = useGeneratedGame(basement, driver);
	if (!game) {
		return <p className='panel please-wait'>Please wait…</p>;
	}

	return <Ui game={game} driver={driver} />;
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
