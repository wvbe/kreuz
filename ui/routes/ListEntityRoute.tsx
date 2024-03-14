import React, { FunctionComponent, useCallback } from 'react';

import { useGameContext } from '../context/GameContext.tsx';
import { EntityList } from '../entities/EntityList.tsx';
import { EcsEntity } from '@lib';

export const ListEntityRoute: FunctionComponent<{
	label: string;
	entityTest: (entity: EcsEntity) => boolean;
}> = ({ label, entityTest }) => {
	const game = useGameContext();
	return <EntityList label={label} entities={game.entities} filter={entityTest} />;
};
