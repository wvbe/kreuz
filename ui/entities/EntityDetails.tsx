import { EcsEntity } from '@lib';
import React, { FunctionComponent } from 'react';
import { GameNavigation, GameNavigationButton } from '../application/GameNavigation.tsx';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { useSelectedEntity } from '../hooks/useSelectedEntity.tsx';
import { ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS } from '../routes/ROUTES.ts';
import { EntityBadge } from './EntityBadge.tsx';
import { EntityBlueprintBadgeDetails } from './details/EntityBlueprintBadgeDetails.tsx';
import { EntityBlueprintProgressDetails } from './details/EntityBlueprintProgressDetails.tsx';
import { EntityHealthDetails } from './details/EntityHealthDetails.tsx';
import { EntityInventoryDetails } from './details/EntityInventoryDetails.tsx';
import { EntityNeedsDetails } from './details/EntityNeedsDetails.tsx';
import { EntityWorkersDetails } from './details/EntityWorkersDetails.tsx';

export const EntityDetails: FunctionComponent<{ entity?: EcsEntity<any> | null }> = ({
	entity,
}) => {
	if (!entity) {
		return null;
	}

	return (
		<>
			<CollapsibleWindow label={`Details panel`} initiallyOpened>
				<EntityBadge entity={entity} />
				<EntityBlueprintBadgeDetails entity={entity} />
				<EntityHealthDetails entity={entity} />
				<EntityNeedsDetails entity={entity} />
				<EntityBlueprintProgressDetails entity={entity} />
				<EntityWorkersDetails entity={entity} />
				<EntityInventoryDetails entity={entity} />
			</CollapsibleWindow>
			{entity.type === 'person' ? (
				<GameNavigation>
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
