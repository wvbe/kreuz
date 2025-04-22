import React, { FC, PropsWithChildren, useMemo } from 'react';
import { hasEcsComponents } from '../../lib/level-1/ecs/assert';
import { healthComponent } from '../../lib/level-1/ecs/components/healthComponent';
import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { ProgressingNumericValue } from '../../lib/level-1/events/ProgressingNumericValue';
import { useEventedValue } from '../../ui/hooks/useEventedValue';

/**
 * If the entity is in a non-living state, display a skull instead of the entity.
 */
const DeathOrChildren: FC<
	PropsWithChildren<{
		health: ProgressingNumericValue;
	}>
> = ({ health, children }) => {
	const h = useEventedValue(health);
	return h ? children : '☠️';
};

/**
 * A component that maps an entity from the game to a presentational component.
 *
 * This component takes an {@link EcsEntity} and displays it using the {@link DeathOrChildren} presentational component.
 */
export const GameEntityIcon: React.FC<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const inner = useMemo(() => {
		if (hasEcsComponents(entity, [visibilityComponent])) {
			return entity.icon;
		}
		return '❓';
	}, [entity]);
	const outer = useMemo(
		() =>
			hasEcsComponents(entity, [healthComponent]) ? (
				<DeathOrChildren health={entity.health}>{inner}</DeathOrChildren>
			) : (
				inner
			),
		[entity, inner],
	);
	return outer;
};
