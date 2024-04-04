import {
	DriverI,
	Game,
	PROMPT_CONSTRUCTION_JOB,
	factoryArchetype,
	marketArchetype,
	personArchetype,
} from '@lib';
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
import { InspectEntityEventLogRoute } from './routes/InspectEntityEventLogRoute.tsx';
import { InspectMaterialRoute } from './routes/InspectMaterialRoute.tsx';
import { ListEntityRoute } from './routes/ListEntityRoute.tsx';
import {
	ROUTE_ENTITIES_DETAILS,
	ROUTE_ENTITIES_PEOPLE,
	ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS,
	ROUTE_MATERIALS,
	ROUTE_MATERIALS_DETAILS,
	ROUTE_PRODUCTION,
	ROUTE_PRODUCTION_DETAILS,
} from './routes/ROUTES.ts';
import { ModalHost, registerUiForPrompt } from './modals/ModalHost.tsx';
import { EntityConstructionModal } from './prompts/EntityConstructionModal.tsx';
import { ROUTE_ENTITIES_EVENTS_DETAILS } from './routes/ROUTES.ts';

registerUiForPrompt(PROMPT_CONSTRUCTION_JOB, EntityConstructionModal);

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
								<Route path={ROUTE_ENTITIES_PEOPLE} Component={ListEntityRoute} />
								<Route path={ROUTE_ENTITIES_DETAILS} Component={InspectEntityRoute} />
								<Route
									path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
									Component={InspectEntityJobsRoute}
								/>
								<Route
									path={ROUTE_ENTITIES_EVENTS_DETAILS}
									Component={InspectEntityEventLogRoute}
								/>
								<Route path={ROUTE_PRODUCTION} Component={ProductionList} />
								<Route path={ROUTE_PRODUCTION_DETAILS} Component={InspectBlueprintRoute} />
								<Route path={ROUTE_MATERIALS} Component={MaterialList} />
								<Route path={ROUTE_MATERIALS_DETAILS} Component={InspectMaterialRoute} />
							</GamePanels>
							<ModalHost />
						</SelectedEntityContextProvider>
					</ReplacementSpaceContext>
				</GameContext>
			</DriverContext>
		</HashRouter>
	);
};
