import { EntityI } from '@lib';
import React, { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Badge } from './atoms/Badge.tsx';

const InnnerEntityBadge: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const status = useEventedValue(entity.$status);
	return <Badge icon={entity.icon} title={entity.name} subtitle={status || ''} />;
};
export const EntityBadge: FunctionComponent<{ entity?: EntityI }> = ({ entity }) =>
	entity ? <InnnerEntityBadge entity={entity} /> : null;
