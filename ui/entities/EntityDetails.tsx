import {
	type EntityI,
	type FactoryBuildingEntity,
	type MarketBuildingEntity,
	type PersonEntity,
} from '@lib';
import React, { FunctionComponent, useMemo } from 'react';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';
import { EntityBadge } from './EntityBadge.tsx';
import { FactoryBuildingEntityDetails } from './FactoryBuildingEntityDetails.tsx';
import { MarketBuildingEntityDetails } from './MarketBuildingEntityDetails.tsx';
import { PersonEntityDetails } from './PersonEntityDetails.tsx';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { GameNavigation } from '../application/GameNavigation.tsx';
import { GameNavigationButton } from '../application/GameNavigation.tsx';
import {
	ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS,
	ROUTE_ENTITIES_PEOPLE_TRADE_DETAILS,
} from '../routes/ROUTES.ts';

export const EntityDetails: FunctionComponent<{ entity?: EntityI | null }> = ({ entity }) => {
	if (!entity) {
		return null;
	}
	const extra = useMemo(() => {
		if (entity.type === 'person') {
			return <PersonEntityDetails entity={entity as PersonEntity} />;
		} else if (entity.type === 'market-stall') {
			return <MarketBuildingEntityDetails entity={entity as MarketBuildingEntity} />;
		} else if (entity.type === 'factory') {
			return <FactoryBuildingEntityDetails entity={entity as FactoryBuildingEntity} />;
		}
	}, [entity]);

	return (
		<>
			<CollapsibleWindow label={`Details panel`} initiallyOpened>
				<EntityBadge entity={entity} />
				{extra}
			</CollapsibleWindow>
			{entity.type === 'person' ? (
				<GameNavigation>
					<GameNavigationButton
						symbol="💰"
						path={ROUTE_ENTITIES_PEOPLE_TRADE_DETAILS}
						params={{ entityId: entity.id }}
						tooltip="Trade"
					/>
					<GameNavigationButton
						symbol="👔"
						path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
						params={{ entityId: entity.id }}
						tooltip="Jobs"
					/>
				</GameNavigation>
			) : null}
		</>
	);
};

export const SelectedEntityDetails: FunctionComponent = () => {
	const selectedEntity = useSelectedEntity();
	return <EntityDetails entity={selectedEntity.current} />;
};
