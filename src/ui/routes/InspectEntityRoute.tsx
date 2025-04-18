import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { eventLogComponent } from '../../lib/level-1/ecs/components/eventLogComponent';
import { useGameContext } from '../../ui2/contexts/GameContext';
import { GameNavigation, GameNavigationButton } from '../application/GameNavigation';
import { EntityDetails } from '../entities/EntityDetails';
import { ROUTE_ENTITIES_EVENTS_DETAILS, ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS } from './ROUTES';

export const InspectEntityRoute: FunctionComponent = () => {
	const { entityId } = useParams<{ entityId: string }>();
	const game = useGameContext();
	const entity = useMemo(() => game.entities.getByKey(entityId!), [entityId]);
	if (!entity) {
		return null;
	}
	return (
		<>
			<EntityDetails entity={entity} />
			<GameNavigation>
				<GameNavigationButton
					symbol='👔'
					path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
					params={{ entityId: entity.id }}
					tooltip='Jobs'
				/>
				{eventLogComponent.test(entity) && (
					<GameNavigationButton
						symbol='📜'
						path={ROUTE_ENTITIES_EVENTS_DETAILS}
						params={{ entityId: entity.id }}
						tooltip='Event log'
					/>
				)}
			</GameNavigation>
		</>
	);
};
