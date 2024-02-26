import React, { FC, useCallback } from 'react';
import { useNavigation } from '../hooks/useNavigation.ts';
import {
	ROUTE_ENTITIES_FACTORIES,
	ROUTE_ENTITIES_MARKETS,
	ROUTE_ENTITIES_PEOPLE,
} from '../routes/ROUTES.ts';

const GameNavigationButton: FC<{
	symbol: string;
	path: string;
	params?: Record<string, string>;
}> = ({ symbol, path, params }) => {
	const navigate = useNavigation();
	const onClick = useCallback(
		(event) => {
			event.preventDefault();
			event.stopPropagation();
			navigate(path, params);
		},
		[path, params],
	);
	return (
		<a onClick={onClick} className="game-navigation-button">
			{symbol}
		</a>
	);
};
export const GameNavigation: FC = () => {
	return (
		<div>
			<GameNavigationButton symbol="🙋" path={ROUTE_ENTITIES_PEOPLE} />
			<GameNavigationButton symbol="🏭" path={ROUTE_ENTITIES_FACTORIES} />
			<GameNavigationButton symbol="🏪" path={ROUTE_ENTITIES_MARKETS} />
		</div>
	);
};
