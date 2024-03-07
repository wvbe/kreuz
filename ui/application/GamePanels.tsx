import React, { FC, PropsWithChildren } from 'react';
import { Routes } from 'react-router-dom';

import {
	ROUTE_ENTITIES_FACTORIES,
	ROUTE_ENTITIES_MARKETS,
	ROUTE_ENTITIES_PEOPLE,
	ROUTE_MATERIALS,
	ROUTE_PRODUCTION,
} from '../routes/ROUTES.ts';
import { GameNavigation, GameNavigationButton } from './GameNavigation.tsx';

export const GamePanels: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="game-panels">
			<GameNavigation>
				<GameNavigationButton symbol="🙋" path={ROUTE_ENTITIES_PEOPLE} tooltip="People" />
				<GameNavigationButton symbol="🏭" path={ROUTE_ENTITIES_FACTORIES} tooltip="Factories" />
				<GameNavigationButton symbol="🏪" path={ROUTE_ENTITIES_MARKETS} tooltip="Market places" />
				<GameNavigationButton symbol="📈" path={ROUTE_PRODUCTION} tooltip="Production overview" />
				<GameNavigationButton symbol="📦" path={ROUTE_MATERIALS} tooltip="Materials list" />
			</GameNavigation>
			{Array.isArray(children) ? children.map((route) => <Routes>{route}</Routes>) : null}
		</div>
	);
};
