import React, { FC, PropsWithChildren } from 'react';
import { Routes } from 'react-router-dom';

import { ROUTE_ENTITIES_PEOPLE, ROUTE_MATERIALS, ROUTE_PRODUCTION } from '../routes/ROUTES';
import { GameNavigation, GameNavigationButton } from './GameNavigation';
import { Clock } from '../time/Clock';

export const GamePanels: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className='game-panels'>
			<Clock />
			<GameNavigation>
				<GameNavigationButton symbol='🙋' path={ROUTE_ENTITIES_PEOPLE} tooltip='People' />
				<GameNavigationButton
					symbol='📈'
					path={ROUTE_PRODUCTION}
					tooltip='Production overview'
				/>
				<GameNavigationButton symbol='📦' path={ROUTE_MATERIALS} tooltip='Materials list' />
			</GameNavigation>
			{Array.isArray(children)
				? children.map((route, i) => <Routes key={i}>{route}</Routes>)
				: null}
		</div>
	);
};
