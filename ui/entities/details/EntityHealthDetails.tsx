import { EntityI, PersonEntity } from '@lib';
import React, { FunctionComponent, useCallback } from 'react';

import { FillBar } from '../../components/atoms/FillBar.tsx';
import { useMemoFromEvent, useEventedValue } from '../../hooks/useEventedValue.ts';

export const EntityHealthDetails: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const health = (entity as PersonEntity).$health;
	if (!health) {
		return null;
	}
	const value = useEventedValue(health);
	const getDeltaLabel = useCallback(() => {
		if (health.delta > -0) {
			return `Improving`;
		}
		if (health.delta < -0) {
			return `Declining`;
		}
		return 'Stable';
	}, [health]);

	const delta = useMemoFromEvent(health.$recalibrate, getDeltaLabel(), getDeltaLabel);

	return <FillBar ratio={value} label={'Overall health'} labelRight={delta} />;
};
