import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { JobCandidate } from '../../lib/level-1/classes/JobBoard';
import { personArchetype } from '../../lib/level-1/ecs/archetypes/personArchetype';
import { EcsArchetypeEntity } from '../../lib/level-1/ecs/types';
import { Collection } from '../../lib/level-1/events/Collection';
import { EventCombination } from '../../lib/level-1/events/EventCombination';
import { useGameContext } from '../context/GameContext';
import { useMemoFromEvent } from '../hooks/useEventedValue';
import { CollapsibleWindow } from './atoms/CollapsibleWindow';
import { Cell, Row, Table } from './atoms/Table';
import { TokenizedText } from './atoms/TokenizedText';
// import { LineGraph } from './LineGraph';

export function useCombinedEventCollection<T>(
	collection: Collection<T>,
	otherEvent?: Event<any[]>,
) {
	const combinedEvent = useMemo(
		() =>
			otherEvent
				? new EventCombination('combined event', [collection.$change, otherEvent])
				: collection.$change,
		[],
	);
	const transform = useCallback(() => collection.slice(), [collection]);
	return useMemoFromEvent<any[], T[]>(combinedEvent, collection.slice(), transform);
}

export const JobList: FunctionComponent<{
	entity: EcsArchetypeEntity<typeof personArchetype>;
}> = ({ entity }) => {
	const game = useGameContext();
	const [jobs, setJobs] = useState<JobCandidate[]>([]);

	useEffect(() => {
		const updateJobState = () => {
			setJobs(
				game.jobs
					.forEntity(entity)
					.map((ev) => ev())
					.sort((a, b) => b.score - a.score),
			);
		};
		const interval = setInterval(updateJobState, 1000);
		updateJobState();
		return () => {
			clearInterval(interval);
		};
	}, [game, entity]);

	const sortedJobs = useMemo(
		() =>
			jobs.map((job, index) => (
				<Row key={index}>
					<Cell>
						<TokenizedText text={job.label} />
					</Cell>
					<Cell>{job.score.toFixed(4)}</Cell>
				</Row>
			)),
		[jobs],
	);

	return (
		<CollapsibleWindow label={`Job board`} initiallyOpened>
			<Table>{sortedJobs}</Table>
		</CollapsibleWindow>
	);
};
