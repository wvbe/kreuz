import React, { type FunctionComponent } from 'react';
import { createRoot } from 'react-dom';
import { useGeneratedGame, GameUI } from '../ui/mod.ts';
import { AlephDriver } from './driver.ts';
import { GameContext, DriverContext, ReplacementSpaceContext } from '@ui';

const driver = new AlephDriver();

const Application: FunctionComponent = () => {
	const game = useGeneratedGame(driver);

	if (!game) {
		return <p>Please wait…</p>;
	}

	return (
		<DriverContext driver={driver}>
			<GameContext game={game}>
				<ReplacementSpaceContext>
					<GameUI />
				</ReplacementSpaceContext>
			</GameContext>
		</DriverContext>
	);
};

createRoot(self.document.getElementById('root')).render(<Application />);
