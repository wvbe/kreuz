import React, { FC, PropsWithChildren, useMemo } from 'react';
import { hasEcsComponents } from '../../lib/level-1/ecs/assert';
import { healthComponent } from '../../lib/level-1/ecs/components/healthComponent';
import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { ProgressingNumericValue } from '../../lib/level-1/events/ProgressingNumericValue';
import { useEventedValue } from '../../ui/hooks/useEventedValue';

const DeathOrChildren: FC<
	PropsWithChildren<{
		health: ProgressingNumericValue;
	}>
> = ({ health, children }) => {
	const h = useEventedValue(health);
	return h ? children : '☠️';
};

export const GameEntityIcon: React.FC<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const inner = useMemo(() => {
		if (hasEcsComponents(entity, [visibilityComponent])) {
			return entity.icon;
		}
		return null;
	}, [entity]);
	const outer = useMemo(
		() =>
			hasEcsComponents(entity, [healthComponent]) ? (
				<DeathOrChildren health={entity.health}>{inner}</DeathOrChildren>
			) : (
				inner
			),
		[],
	);
	return outer;
};
