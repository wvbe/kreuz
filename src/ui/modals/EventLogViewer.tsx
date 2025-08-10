import React, { useMemo } from 'react';
import { eventLogComponent } from '../../game/core/ecs/components/eventLogComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { useCollection } from '../hooks/useEventedValue';
import styles from './EventLogViewer.module.css';

/**
 * A React component that displays a list of events from an entity's event log component in a modal.
 *
 * @param entity - The entity whose event log should be displayed
 * @param onClose - Callback function to close the modal
 * @param initialPosition - Optional initial position for the modal
 *
 * @returns A modal component displaying the entity's event log
 */
export interface EventLogViewerProps {
	entity: EcsEntity<typeof eventLogComponent>;
	onClose: () => void;
	initialPosition?: { x: number; y: number };
}

export const EventLogViewer: React.FC<EventLogViewerProps> = ({
	entity,
	onClose,
	initialPosition,
}) => {
	const events = useCollection(entity.events);
	const collapseNeighboringEventsThatAreEqual = useMemo(
		() =>
			events
				.reduce((acc, event) => {
					if (acc.length > 0 && acc[acc.length - 1].payload === event) {
						acc[acc.length - 1].count++;
						return acc;
					} else {
						acc.push({ payload: event, count: 1 });
					}
					return acc;
				}, [] as { payload: (typeof events)[number]; count: number }[])
				.map((x, index) => (
					<div key={index}>
						{x.payload} ({x.count})
					</div>
				)),
		[events],
	);

	return <div className={styles.eventList}>{collapseNeighboringEventsThatAreEqual}</div>;
};
