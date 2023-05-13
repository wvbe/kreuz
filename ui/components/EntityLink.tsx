import { type EntityI } from '@lib';
import React, { type FunctionComponent, useCallback } from 'react';

import { setSelectedEntity } from '../hooks/useSelectedEntity.ts';

export const EntityLink: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const onClick = useCallback(
		(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
			event.preventDefault();
			event.stopPropagation();
			setSelectedEntity(entity);
		},
		[entity],
	);

	return (
		<a href="#" onClick={onClick}>
			{entity.label}
		</a>
	);
};
