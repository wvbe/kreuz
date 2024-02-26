import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext.tsx';
import { EntityDetails } from '../entities/EntityDetails.tsx';

export const InspectRoute: FunctionComponent = () => {
	const { entityId } = useParams<{ entityId: string }>();
	const game = useGameContext();
	const entity = useMemo(() => game.entities.getByKey(entityId!), [entityId]);
	return <EntityDetails entity={entity} />;
};
