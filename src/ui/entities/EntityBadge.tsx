import React, { FunctionComponent } from 'react';
import { EcsComponent } from 'src/lib/level-1/ecs/classes/EcsComponent';
import { eventLogComponent } from 'src/lib/level-1/ecs/components/eventLogComponent';
import { visibilityComponent } from 'src/lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';
import { Badge } from '../components/atoms/Badge';
import { TokenizedText } from '../components/atoms/TokenizedText';
import { useCollection } from '../hooks/useEventedValue';

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
