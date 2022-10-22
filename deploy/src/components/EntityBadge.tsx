import { EntityI } from '@lib';
import { FunctionComponent } from 'react';
import { Badge } from './atoms/Badge.tsx';

export const EntityBadge: FunctionComponent<{ entity?: EntityI }> = ({ entity }) =>
	entity ? <Badge icon={entity.icon} title={entity.name} subtitle={entity.title} /> : null;
