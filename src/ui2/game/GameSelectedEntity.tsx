import React, { useMemo } from 'react';
import { assertEcsComponents, hasEcsComponents } from '../../lib/level-1/ecs/assert';
import { eventLogComponent } from '../../lib/level-1/ecs/components/eventLogComponent';
import { inventoryComponent } from '../../lib/level-1/ecs/components/inventoryComponent';
import { locationComponent } from '../../lib/level-1/ecs/components/locationComponent';
import { pathingComponent } from '../../lib/level-1/ecs/components/pathingComponent';
import { visibilityComponent } from '../../lib/level-1/ecs/components/visibilityComponent';
import { wealthComponent } from '../../lib/level-1/ecs/components/wealthComponent';
import { useControlsContext } from '../contexts/ControlsContext';
import { Panel } from '../hud/atoms/Panel';
import EntityControls, { EntityControlsProps } from '../hud/EntityControls';
import { ErrorBoundary } from '../util/ErrorBoundary';
import { GameEntityIcon } from './GameEntityIcon';
import EventLogTab from './tabs/EventLogTab';
import InventoryTab from './tabs/InventoryTab';
import PathingTab from './tabs/PathingTab';

const NO_ENTITY_SELECTED_ENTITY = { id: 'no-entity-selected' };

/**
 * A component that maps the selected game entity to a presentational component.
 *
 * This component uses the {@link EntityControls} presentational component to display controls for the selected entity.
 */
const GameSelectedEntity: React.FC = () => {
	const { state, selectEntity } = useControlsContext();

	const entityControlProps = useMemo<EntityControlsProps>(() => {
		const selectedEntity = state.selectedEntity ?? NO_ENTITY_SELECTED_ENTITY;

		// Asserting the components here informs the TS language server what the types
		// are for the rest of the function. The function will not actually throw if an
		// "optional" component is missing.
		assertEcsComponents(
			selectedEntity,
			[],
			[visibilityComponent, locationComponent, wealthComponent],
		);

		const props: EntityControlsProps = {
			icon: (
				<div style={{ fontSize: `${selectedEntity.iconSize ?? 0.4}em` }}>
					<GameEntityIcon entity={selectedEntity} />
				</div>
			),
			entityInfo: [],
			tabs: [],
		};

		if (hasEcsComponents(selectedEntity, [visibilityComponent])) {
			props.entityInfo.push({ key: 'Name', value: selectedEntity.name });
		}

		if (hasEcsComponents(selectedEntity, [eventLogComponent])) {
			props.tabs!.push({
				label: 'Events',
				Content: () => <EventLogTab entity={selectedEntity} />,
			});
		}
		if (hasEcsComponents(selectedEntity, [inventoryComponent])) {
			props.tabs!.push({
				label: 'Inventory',
				Content: () => <InventoryTab entity={selectedEntity} />,
			});
		}
		if (hasEcsComponents(selectedEntity, [pathingComponent])) {
			props.tabs!.push({
				label: 'Pathing',
				Content: () => <PathingTab entity={selectedEntity} />,
			});
		}

		return props;
	}, [state.selectedEntity]);

	return (
		<Panel data-component='GameSelectedEntity'>
			<ErrorBoundary>
				<EntityControls {...entityControlProps} />
			</ErrorBoundary>
		</Panel>
	);
};

export { GameSelectedEntity };
