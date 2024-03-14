import * as React from 'react';
import { useParams } from 'react-router-dom';

import { EcsEntity, locationComponent } from '@lib';
import { TradeOrderLog } from '../components/TradeOrderLog.tsx';
import { useGameContext } from '../context/GameContext.tsx';

export const InspectEntityTradelogRoute: React.FC = () => {
	const { entityId } = useParams();
	const game = useGameContext();
	const entity = React.useMemo(
		() => game.entities.getByKey(entityId!) as EcsEntity<typeof locationComponent>,
		[entityId],
	);

	return <TradeOrderLog entity={entity} log={entity.$log} />;
};
