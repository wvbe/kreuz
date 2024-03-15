import React, { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Badge } from '../components/atoms/Badge.tsx';
import { TokenizedText } from '../components/atoms/TokenizedText.tsx';
import { EcsEntity } from '@lib';
import { statusComponent } from '@lib';
import { visibilityComponent } from '@lib';

const InnerEntityBadge: FunctionComponent<{
	entity: EcsEntity<typeof visibilityComponent | any>;
}> = ({ entity }) => {
	const status = statusComponent.test(entity)
		? useEventedValue(
				(entity as EcsEntity<typeof statusComponent | typeof visibilityComponent>).$status,
		  )
		: null;
	const icon = (entity as EcsEntity<typeof visibilityComponent>).icon || '👺';
	const name = (entity as EcsEntity<typeof visibilityComponent>).name || entity.id;
	return <Badge icon={icon} title={name} subtitle={<TokenizedText text={status || ''} />} />;
};
export const EntityBadge: FunctionComponent<{
	entity?: EcsEntity<typeof visibilityComponent | any>;
}> = ({ entity }) => (entity ? <InnerEntityBadge entity={entity} /> : null);
