import { DriverI, Game } from '@lib';
import React, { FC, PropsWithChildren, type FunctionComponent } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { GameClock } from './application/GameClock.tsx';
import { GameMap } from './application/GameMap.tsx';
import { GamePanels } from './application/GamePanels.tsx';
import { DriverContext } from './context/DriverContext.tsx';
import { GameContext } from './context/GameContext.tsx';
import { ReplacementSpaceContext } from './context/ReplacementSpaceContext.tsx';
import { SelectedEntityContextProvider } from './hooks/useSelectedEntity.tsx';
import { InspectRoute } from './routes/InspectRoute.tsx';
import { ListEntityRoute } from './routes/ListEntityRoute.tsx';
import {
	ROUTE_ENTITIES_FACTORIES,
	ROUTE_ENTITIES_FACTORIES_DETAILS,
	ROUTE_ENTITIES_MARKETS,
	ROUTE_ENTITIES_MARKETS_DETAILS,
	ROUTE_ENTITIES_PEOPLE,
	ROUTE_ENTITIES_PEOPLE_DETAILS,
} from './routes/ROUTES.ts';

const ListPeopleEntities: FC<PropsWithChildren> = ({ children }) => (
	<>
		<ListEntityRoute label="People" entityTypes={['person']} />
		<Routes>{children}</Routes>
	</>
);
const ListFactoryEntities: FC<PropsWithChildren> = ({ children }) => (
	<>
		<ListEntityRoute label="Factories" entityTypes={['factory']} />
		<Routes>{children}</Routes>
	</>
);
const ListMarketEntities: FC<PropsWithChildren> = ({ children }) => (
	<>
		<ListEntityRoute label="Market places" entityTypes={['market-stall']} />
		<Routes>{children}</Routes>
	</>
);

export const GameInterface: FunctionComponent<{
	driver: DriverI;
	game: Game;
}> = ({ driver, game }) => {
	return (
		<HashRouter>
			<DriverContext driver={driver}>
				<GameContext game={game}>
					<ReplacementSpaceContext>
						<SelectedEntityContextProvider>
							<GameClock />
							<GameMap />
							<GamePanels>
								<Route path={ROUTE_ENTITIES_PEOPLE} Component={ListPeopleEntities} />
								<Route path={ROUTE_ENTITIES_PEOPLE_DETAILS} Component={InspectRoute} />
								<Route path={ROUTE_ENTITIES_FACTORIES} Component={ListFactoryEntities} />
								<Route path={ROUTE_ENTITIES_FACTORIES_DETAILS} Component={InspectRoute} />
								<Route path={ROUTE_ENTITIES_MARKETS} Component={ListMarketEntities} />
								<Route path={ROUTE_ENTITIES_MARKETS_DETAILS} Component={InspectRoute} />
							</GamePanels>
						</SelectedEntityContextProvider>
					</ReplacementSpaceContext>
				</GameContext>
			</DriverContext>
		</HashRouter>
	);
};
