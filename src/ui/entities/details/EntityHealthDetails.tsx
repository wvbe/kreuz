import React, { FunctionComponent, useCallback } from 'react';
import { FillBar } from '../../components/atoms/FillBar';
import { useEventedValue, useMemoFromEvent } from '../../hooks/useEventedValue';
import { healthComponent } from 'src/lib/level-1/ecs/components/healthComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';

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
