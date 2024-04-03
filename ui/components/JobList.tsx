import {
	Collection,
	EcsArchetypeEntity,
	EcsEntity,
	Event,
	JobCandidate,
	locationComponent,
	personArchetype,
} from '@lib';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { EventCombination } from '../../library/level-1/events/EventCombination.ts';
import { useGameContext } from '../context/GameContext.tsx';
import { useMemoFromEvent } from '../hooks/useEventedValue.ts';
import { CollapsibleWindow } from './atoms/CollapsibleWindow.tsx';
import { Cell, Row, Table } from './atoms/Table.tsx';
import { TokenizedText } from './atoms/TokenizedText.tsx';
// import { LineGraph } from './LineGraph.tsx';

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
	return useMemoFromEvent<any[], T[]>(
		combinedEvent,
		collection.slice(),
		useCallback(() => collection.slice(), [collection]),
	);
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
