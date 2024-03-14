import React, { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Badge } from '../components/atoms/Badge.tsx';
import { TokenizedText } from '../components/atoms/TokenizedText.tsx';
import { EcsEntity } from '@lib';
import { statusComponent } from '@lib';
import { visibilityComponent } from '@lib';

const InnnerEntityBadge: FunctionComponent<{
	entity: EcsEntity<typeof statusComponent | typeof visibilityComponent>;
}> = ({ entity }) => {
	const status = statusComponent.test(entity) ? useEventedValue(entity.$status) : null;
	return (
		<Badge
			icon={entity.icon}
			title={entity.name}
			subtitle={<TokenizedText text={status || ''} />}
		/>
	);
};
export const EntityBadge: FunctionComponent<{
	entity?: EcsEntity<typeof statusComponent | typeof visibilityComponent>;
}> = ({ entity }) => (entity ? <InnnerEntityBadge entity={entity} /> : null);
