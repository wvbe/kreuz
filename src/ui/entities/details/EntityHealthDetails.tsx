import React, { FunctionComponent, useCallback } from 'react';
import { healthComponent } from '../../../lib/level-1/ecs/components/healthComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { FillBar } from '../../components/atoms/FillBar';
import { useEventedValue, useMemoFromEvent } from '../../hooks/useEventedValue';

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
