import { EntityI } from '@lib';
import React, { FunctionComponent } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { Badge } from '../components/atoms/Badge.tsx';
import { TokenizedText } from '../components/atoms/TokenizedText.tsx';

const InnnerEntityBadge: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const status = useEventedValue(entity.$status);
	return (
		<Badge
			icon={entity.icon}
			title={entity.name}
			subtitle={<TokenizedText text={status || ''} />}
		/>
	);
};
export const EntityBadge: FunctionComponent<{ entity?: EntityI }> = ({ entity }) =>
	entity ? <InnnerEntityBadge entity={entity} /> : null;
