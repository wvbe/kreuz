import { EcsEntity, visibilityComponent } from '@lib';
import React, { useCallback, type FC } from 'react';

import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';

export const EntityLink: FC<{ entity: EcsEntity<typeof visibilityComponent> }> = ({ entity }) => {
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
		<a href="#" onClick={onClick}>
			{entity.icon} {entity.name}
		</a>
	);
};
