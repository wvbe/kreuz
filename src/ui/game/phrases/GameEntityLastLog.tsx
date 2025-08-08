import { FC } from 'react';
import { hasEcsComponents } from '../../../game/core/ecs/assert';
import { eventLogComponent } from '../../../game/core/ecs/components/eventLogComponent';
import { EcsEntity } from '../../../game/core/ecs/types';
import { useMemoFromEvent } from '../../hooks/useEventedValue';

function getLastLog(entity?: EcsEntity) {
	if (!entity || !hasEcsComponents(entity, [eventLogComponent])) {
		return null;
	}
	return entity.events.length ? entity.events.get(entity.events.length - 1) : null;
}

export const GameEntityLastLog: FC<{ entity?: EcsEntity }> = ({ entity }) => {
	const lastLog = useMemoFromEvent(
		(entity as EcsEntity<typeof eventLogComponent>)?.events?.$change,
		getLastLog(entity),
		() => getLastLog(entity),
	);
	return lastLog;
};
