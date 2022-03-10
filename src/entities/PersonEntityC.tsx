import React, { FunctionComponent, useCallback, useState } from 'react';
import { useEventCallback } from '../hooks/events';
import { MovingAnchor } from '../rendering/svg/Anchor';
import { PersonEntity } from './PersonEntity';

type OnEntityClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => void;

/**
 * A component that automatically transitions the entity component as per its move instructions
 */
export const PersonEntityC: FunctionComponent<{
	entity: PersonEntity;
	onClick?: OnEntityClick;
}> = ({ entity, onClick }) => {
	const [{ destination, duration }, animatePosition] = useState({
		destination: entity.location,
		duration: 0
	});

	useEventCallback(
		entity.$startedWalkStep,
		useCallback(
			destination =>
				animatePosition({
					destination,
					duration: entity.location.euclideanDistanceTo(destination) * 3000
				}),
			[entity.location]
		),
		[entity.$startedWalkStep, entity.location]
	);

	const onRest = useCallback(
		() => entity.$stoppedWalkStep.emit(destination),
		[entity.$stoppedWalkStep, destination]
	);

	return (
		<MovingAnchor moveTo={destination} moveSpeed={duration} onRest={onRest} onClick={onClick}>
			<entity.Component />
		</MovingAnchor>
	);
};
