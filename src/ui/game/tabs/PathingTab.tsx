import React, { useMemo } from 'react';
import { getTileAtLocation } from '../../../game/core/ecs/components/location/getTileAtLocation';
import { locationComponent } from '../../../game/core/ecs/components/locationComponent';
import { pathingComponent } from '../../../game/core/ecs/components/pathingComponent';
import { EcsEntity } from '../../../game/core/ecs/types';
import { useGameContext } from '../../contexts/GameContext';
import { useEventedValue } from '../../hooks/useEventedValue';
import { EntityPath } from '../../hud/EntityPath';

/**
 * A React component that displays information about the pathing component of an entity.
 *
 * @param entity - The entity with a pathing component.
 *
 * @returns A JSX element displaying the pathing component details.
 *
 * @see {@link pathingComponent}
 */
const PathingTab: React.FC<{
	entity: EcsEntity<typeof pathingComponent | typeof locationComponent>;
}> = ({ entity }) => {
	const path = useEventedValue(entity.$path);

	const location = useEventedValue(entity.location);
	const game = useGameContext();
	const locationTile = useMemo(() => {
		if (location) {
			return getTileAtLocation(location);
		}
		return null;
	}, [game, location]);

	const stepStart = useEventedValue(entity.$stepStart);
	return (
		<div>
			<EntityPath
				tiles={path ? [...path] : path}
				currentTile={locationTile ?? undefined}
				nextTile={
					stepStart?.destination ? getTileAtLocation(stepStart.destination)! : undefined
				}
			/>
		</div>
	);
};

export default PathingTab;
