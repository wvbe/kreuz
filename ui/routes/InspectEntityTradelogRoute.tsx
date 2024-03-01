import * as React from 'react';
import { useParams } from 'react-router-dom';
import { PersonEntity } from '@lib';

import { TradeOrderLog } from '../components/TradeOrderLog.tsx';
import { useGameContext } from '../context/GameContext.tsx';

export const InspectEntityTradelogRoute: React.FC = () => {
	const { entityId } = useParams();
	const game = useGameContext();
	const entity = React.useMemo(() => game.entities.getByKey(entityId!) as PersonEntity, [entityId]);

	return <TradeOrderLog entity={entity} log={entity.$log} />;
};
