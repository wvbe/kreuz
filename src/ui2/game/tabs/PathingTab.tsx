import React, { useMemo } from 'react';
import { locationComponent } from '../../../lib/level-1/ecs/components/locationComponent';
import { pathingComponent } from '../../../lib/level-1/ecs/components/pathingComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { useEventedValue } from '../../../ui/hooks/useEventedValue';
import { useGameContext } from '../../contexts/GameContext';
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
			return game.terrain.getTileEqualToLocation(location);
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
					stepStart?.destination
						? game.terrain.getTileEqualToLocation(stepStart.destination)!
						: undefined
				}
			/>
		</div>
	);
};

export default PathingTab;
