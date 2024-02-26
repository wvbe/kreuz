import React, { FC, PropsWithChildren } from 'react';
import { Routes } from 'react-router-dom';
import { GameNavigation } from './GameNavigation.tsx';

export const GamePanels: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="game-panels">
			<GameNavigation />
			{Array.isArray(children) ? children.map((route) => <Routes>{route}</Routes>) : null}
		</div>
	);
};
