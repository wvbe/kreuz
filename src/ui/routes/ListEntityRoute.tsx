import React, { FunctionComponent } from 'react';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { useGameContext } from '../../ui2/contexts/GameContext';
import { EntityList } from '../entities/EntityList';

function allEntities(entity: EcsEntity) {
	return true;
}
export const ListEntityRoute: FunctionComponent = () => {
	const game = useGameContext();
	return <EntityList label={'Entities'} entities={game.entities.living} filter={allEntities} />;
};
