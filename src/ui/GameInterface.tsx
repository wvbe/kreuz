import React, { type FunctionComponent } from 'react';
import { HashRouter, Route } from 'react-router-dom';

import { DriverI } from '../lib/level-1/drivers/types';
import Game from '../lib/level-1/Game';
import { PROMPT_CONSTRUCTION_JOB } from '../lib/level-2/commands/constructEntity';
import { DriverContext } from '../ui2/contexts/DriverContext';
import { GameContext } from '../ui2/contexts/GameContext';
import { ReplacementSpaceContext } from '../ui2/contexts/ReplacementSpaceContext';
import { HtmlMapTerrain } from '../ui2/game/HtmlMapTerrain';
import { HtmlMapEntities } from '../ui2/map/HtmlMapEntities';
import { PanZoomable } from '../ui2/util/PanZoomable';
import { GameClock } from './application/GameClock';
import { GamePanels } from './application/GamePanels';
import { MaterialList } from './components/MaterialList';
import { ProductionList } from './components/ProductionList';
import { MapTileContextMenuHost } from './context-menu/MAP_TILE_CONTEXT_MENU';
import { SelectedEntityContextProvider } from './hooks/useSelectedEntity';
import { ModalHost, registerUiForPrompt } from './modals/ModalHost';
import { EntityConstructionModal } from './prompts/EntityConstructionModal';
import { InspectBlueprintRoute } from './routes/InspectBlueprintRoute';
import { InspectEntityEventLogRoute } from './routes/InspectEntityEventLogRoute';
import { InspectEntityJobsRoute } from './routes/InspectEntityJobsRoute';
import { InspectEntityRoute } from './routes/InspectEntityRoute';
import { InspectMaterialRoute } from './routes/InspectMaterialRoute';
import { ListEntityRoute } from './routes/ListEntityRoute';
import {
	ROUTE_ENTITIES_DETAILS,
	ROUTE_ENTITIES_EVENTS_DETAILS,
	ROUTE_ENTITIES_PEOPLE,
	ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS,
	ROUTE_MATERIALS,
	ROUTE_MATERIALS_DETAILS,
	ROUTE_PRODUCTION,
	ROUTE_PRODUCTION_DETAILS,
} from './routes/ROUTES';

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
							<PanZoomable>
								<MapTileContextMenuHost>
									<div style={{ position: 'absolute', top: '50%', left: '50%' }}>
										<HtmlMapTerrain terrain={game.terrain} />
										<HtmlMapEntities entities={game.entities} />
									</div>
								</MapTileContextMenuHost>
							</PanZoomable>
							<GamePanels>
								<Route path={ROUTE_ENTITIES_PEOPLE} Component={ListEntityRoute} />
								<Route
									path={ROUTE_ENTITIES_DETAILS}
									Component={InspectEntityRoute}
								/>
								<Route
									path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
									Component={InspectEntityJobsRoute}
								/>
								<Route
									path={ROUTE_ENTITIES_EVENTS_DETAILS}
									Component={InspectEntityEventLogRoute}
								/>
								<Route path={ROUTE_PRODUCTION} Component={ProductionList} />
								<Route
									path={ROUTE_PRODUCTION_DETAILS}
									Component={InspectBlueprintRoute}
								/>
								<Route path={ROUTE_MATERIALS} Component={MaterialList} />
								<Route
									path={ROUTE_MATERIALS_DETAILS}
									Component={InspectMaterialRoute}
								/>
							</GamePanels>
							<ModalHost />
						</SelectedEntityContextProvider>
					</ReplacementSpaceContext>
				</GameContext>
			</DriverContext>
		</HashRouter>
	);
};
