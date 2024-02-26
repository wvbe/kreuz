import React, { type FunctionComponent } from 'react';
import { createRoot } from 'react-dom';

import { GameInterface, useGeneratedGame } from '@ui';
import { BrowserDriver } from './BrowserDriver.ts';

const driver = new BrowserDriver();

const Application: FunctionComponent = () => {
	const game = useGeneratedGame(driver);

	if (!game) {
		return <p>Please wait…</p>;
	}

	return <GameInterface game={game} driver={driver} />;
};

createRoot(self.document.getElementById('root')).render(<Application />);
