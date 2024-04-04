import { EcsComponent, EcsEntity, eventLogComponent, visibilityComponent } from '@lib';
import React, { FunctionComponent } from 'react';
import { Badge } from '../components/atoms/Badge.tsx';
import { TokenizedText } from '../components/atoms/TokenizedText.tsx';
import { useCollection } from '../hooks/useEventedValue.ts';

const InnerEntityBadge: FunctionComponent<{
	entity: EcsEntity<EcsComponent, typeof visibilityComponent | typeof eventLogComponent>;
}> = ({ entity }) => {
	const status = eventLogComponent.test(entity) ? useCollection(entity.events) : [];
	const icon = entity.icon || '👺';
	const name = entity.name || entity.id;
	return (
		<Badge
			icon={icon}
			title={name}
			subtitle={<TokenizedText text={status[status.length - 1] || ''} />}
		/>
	);
};
export const EntityBadge: FunctionComponent<{
	entity: EcsEntity<EcsComponent, typeof visibilityComponent | typeof eventLogComponent>;
}> = ({ entity }) => (entity ? <InnerEntityBadge entity={entity} /> : null);
