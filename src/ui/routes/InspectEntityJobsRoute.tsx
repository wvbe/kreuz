import * as React from 'react';
import { useParams } from 'react-router-dom';
import { personArchetype } from '../../lib/level-1/ecs/archetypes/personArchetype';
import { EcsArchetypeEntity } from '../../lib/level-1/ecs/types';
import { JobList } from '../components/JobList';
import { useGameContext } from '../context/GameContext';

export const InspectEntityJobsRoute: React.FC = () => {
	const { entityId } = useParams();
	const game = useGameContext();
	const entity = React.useMemo(
		() => game.entities.getByKey(entityId!) as EcsArchetypeEntity<typeof personArchetype>,
		[entityId],
	);
	if (!entity) {
		return null;
	}

	return <JobList entity={entity} />;
};
