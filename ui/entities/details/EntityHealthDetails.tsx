import React, { FunctionComponent, useCallback } from 'react';

import { EcsEntity, healthComponent } from '@lib';
import { FillBar } from '../../components/atoms/FillBar.tsx';
import { useEventedValue, useMemoFromEvent } from '../../hooks/useEventedValue.ts';

export const EntityHealthDetails: FunctionComponent<{ entity: EcsEntity }> = ({ entity }) => {
	const health = (entity as EcsEntity<typeof healthComponent>).health;
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
