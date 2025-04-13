import React, { useCallback, type FC } from 'react';

import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { useSelectedEntity } from '../hooks/useSelectedEntity';

export const EntityLink: FC<{
	entity: EcsEntity<typeof visibilityComponent>;
}> = ({ entity }) => {
	const selectedEntity = useSelectedEntity();
	const onClick = useCallback(
		(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
			event.preventDefault();
			event.stopPropagation();
			selectedEntity.set(entity);
		},
		[entity],
	);

	return (
		<a href='#' onClick={onClick}>
			{entity.icon} {entity.name}
		</a>
	);
};
