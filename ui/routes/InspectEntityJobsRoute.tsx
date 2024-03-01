import { PersonEntity } from '@lib';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { JobList } from '../components/JobList.tsx';
import { useGameContext } from '../context/GameContext.tsx';

export const InspectEntityJobsRoute: React.FC = () => {
	const { entityId } = useParams();
	const game = useGameContext();
	const entity = React.useMemo(() => game.entities.getByKey(entityId!) as PersonEntity, [entityId]);

	return <JobList entity={entity} />;
};
