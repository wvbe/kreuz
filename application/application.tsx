import { DriverContext, GameContext, GameUI, ReplacementSpaceContext, useGeneratedGame } from '@ui';
import React, { type FunctionComponent } from 'react';
import { createRoot } from 'react-dom';
import { BrowserDriver } from './driver.ts';

const driver = new BrowserDriver();

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
