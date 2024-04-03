import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext.tsx';
import { EntityDetails } from '../entities/EntityDetails.tsx';
import { GameNavigation, GameNavigationButton } from '../application/GameNavigation.tsx';
import { ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS } from './ROUTES.ts';

export const InspectEntityRoute: FunctionComponent = () => {
	const { entityId } = useParams<{ entityId: string }>();
	const game = useGameContext();
	const entity = useMemo(
		() =>
			game.entities.getByKey(entityId!) || game.terrain.tiles.find((tile) => tile.id === entityId),
		[entityId],
	);
	if (!entity) {
		return null;
	}
	return (
		<>
			<EntityDetails entity={entity} />
			<GameNavigation>
				<GameNavigationButton
					symbol="👔"
					path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
					params={{ entityId: entity.id }}
					tooltip="Jobs"
				/>
			</GameNavigation>
		</>
	);
};
