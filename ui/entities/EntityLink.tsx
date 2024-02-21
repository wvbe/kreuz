import { type EntityI } from '@lib';
import React, { useCallback, type FunctionComponent } from 'react';

import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';

export const EntityLink: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
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
			{entity.label}
		</a>
	);
};
