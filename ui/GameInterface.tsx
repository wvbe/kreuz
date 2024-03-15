import { DriverI, Game, factoryArchetype, marketArchetype, personArchetype } from '@lib';
import React, { FC, PropsWithChildren, type FunctionComponent } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { GameClock } from './application/GameClock.tsx';
import { GameMap } from './application/GameMap.tsx';
import { GamePanels } from './application/GamePanels.tsx';
import { MaterialList } from './components/MaterialList.tsx';
import { ProductionList } from './components/ProductionList.tsx';
import { DriverContext } from './context/DriverContext.tsx';
import { GameContext } from './context/GameContext.tsx';
import { ReplacementSpaceContext } from './context/ReplacementSpaceContext.tsx';
import { SelectedEntityContextProvider } from './hooks/useSelectedEntity.tsx';
import { InspectBlueprintRoute } from './routes/InspectBlueprintRoute.tsx';
import { InspectEntityJobsRoute } from './routes/InspectEntityJobsRoute.tsx';
import { InspectEntityRoute } from './routes/InspectEntityRoute.tsx';
import { InspectMaterialRoute } from './routes/InspectMaterialRoute.tsx';
import { ListEntityRoute } from './routes/ListEntityRoute.tsx';
import {
	ROUTE_ENTITIES_DETAILS,
	ROUTE_ENTITIES_FACTORIES,
	ROUTE_ENTITIES_MARKETS,
	ROUTE_ENTITIES_PEOPLE,
	ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS,
	ROUTE_MATERIALS,
	ROUTE_MATERIALS_DETAILS,
	ROUTE_PRODUCTION,
	ROUTE_PRODUCTION_DETAILS
} from './routes/ROUTES.ts';

const ListPeopleEntities: FC<PropsWithChildren> = ({ children }) => (
	<>
		<ListEntityRoute label="People" entityTest={personArchetype.test.bind(personArchetype)} />
		<Routes>{children}</Routes>
	</>
);
const ListFactoryEntities: FC<PropsWithChildren> = ({ children }) => (
	<>
		<ListEntityRoute label="Factories" entityTest={factoryArchetype.test.bind(factoryArchetype)} />
		<Routes>{children}</Routes>
	</>
);
const ListMarketEntities: FC<PropsWithChildren> = ({ children }) => (
	<>
		<ListEntityRoute
			label="Market places"
			entityTest={marketArchetype.test.bind(marketArchetype)}
		/>
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
								<Route path={ROUTE_ENTITIES_DETAILS} Component={InspectEntityRoute} />
								<Route
									path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
									Component={InspectEntityJobsRoute}
								/>
								<Route path={ROUTE_ENTITIES_FACTORIES} Component={ListFactoryEntities} />
								<Route path={ROUTE_ENTITIES_MARKETS} Component={ListMarketEntities} />
								<Route path={ROUTE_PRODUCTION} Component={ProductionList} />
								<Route path={ROUTE_PRODUCTION_DETAILS} Component={InspectBlueprintRoute} />
								<Route path={ROUTE_MATERIALS} Component={MaterialList} />
								<Route path={ROUTE_MATERIALS_DETAILS} Component={InspectMaterialRoute} />
							</GamePanels>
						</SelectedEntityContextProvider>
					</ReplacementSpaceContext>
				</GameContext>
			</DriverContext>
		</HashRouter>
	);
};
