import React, { FunctionComponent, useMemo } from 'react';
import { hasEcsComponents } from '../../lib/level-1/ecs/assert';
import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { EntityBadge } from '../hud/EntityBadge';
import { GameEntityIcon } from './GameEntityIcon';

/**
 * A component that maps an entity from the game to a presentational component.
 *
 * This component takes an {@link EcsEntity} and displays it using the {@link EntityBadge} presentational component.
 */
export const GameEntityBadge: FunctionComponent<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const name = useMemo(() => {
		if (hasEcsComponents(entity, [visibilityComponent])) {
			return entity.name;
		}
		return `Unnamed entity ${entity.id}`;
	}, [entity]);

	return (
		<EntityBadge icon={<GameEntityIcon entity={entity} />} title={name} subtitle={'Nerfing'} />
	);
};
