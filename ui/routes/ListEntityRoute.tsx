import React, { FunctionComponent, useCallback } from 'react';

import { useGameContext } from '../context/GameContext.tsx';
import { EntityList } from '../entities/EntityList.tsx';

export const ListEntityRoute: FunctionComponent<{
	label: string;
	entityTypes: string[];
}> = ({ label, entityTypes }) => {
	const game = useGameContext();
	const filter = useCallback((e) => entityTypes.includes(e.type), [entityTypes]);
	return <EntityList label={label} entities={game.entities} filter={filter}  />;
};
