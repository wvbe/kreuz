import React, { type FC } from 'react';
import { createRoot } from 'react-dom';
import { useGeneratedGame, GameUI } from '../ui/mod.ts';
import { AlephDriver } from './driver.ts';

const root = createRoot(self.document.getElementById('root'));

const driver = new AlephDriver();
const Application: FC = () => {
	const game = useGeneratedGame(driver);

	if (!game) {
		return <p>Please wait...</p>;
	}
	return <GameUI game={game} driver={driver} />;
};

root.render(<Application />);
