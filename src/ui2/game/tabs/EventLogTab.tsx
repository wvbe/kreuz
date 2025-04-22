import React from 'react';
import { eventLogComponent } from '../../../lib/level-1/ecs/components/eventLogComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { useCollection } from '../../../ui/hooks/useEventedValue';

/**
 * A React component that displays information about the event log component of an entity.
 *
 * @param entity - The entity with an event log component.
 *
 * @returns A JSX element displaying the event log component details.
 *
 * @see {@link eventLogComponent}
 */
const EventLogTab: React.FC<{ entity: EcsEntity<typeof eventLogComponent> }> = ({ entity }) => {
	const events = useCollection(entity.events);
	return (
		<div className='event-log-tab'>
			{events.slice(events.length - 3).map((event, index) => (
				<div key={index}>{event}</div>
			))}
		</div>
	);
};

export default EventLogTab;
