import React, { FunctionComponent } from 'react';
import { EcsEntity } from '../../lib/level-1/ecs/types';
import { EntityBadge } from '../../ui2/hud/EntityBadge';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow';
import { EntityBlueprintBadgeDetails } from './details/EntityBlueprintBadgeDetails';
import { EntityBlueprintProgressDetails } from './details/EntityBlueprintProgressDetails';
import { EntityHealthDetails } from './details/EntityHealthDetails';
import { EntityInventoryDetails } from './details/EntityInventoryDetails';
import { EntityNeedsDetails } from './details/EntityNeedsDetails';
import { EntityWorkersDetails } from './details/EntityWorkersDetails';

export const EntityDetails: FunctionComponent<{ entity: EcsEntity<any> }> = ({ entity }) => {
	return (
		<CollapsibleWindow label={`Details panel`} initiallyOpened>
			<EntityBadge entity={entity} />
			<EntityBlueprintBadgeDetails entity={entity} />
			<EntityHealthDetails entity={entity} />
			<EntityNeedsDetails entity={entity} />
			<EntityBlueprintProgressDetails entity={entity} />
			<EntityWorkersDetails entity={entity} />
			<EntityInventoryDetails entity={entity} />
		</CollapsibleWindow>
	);
};
