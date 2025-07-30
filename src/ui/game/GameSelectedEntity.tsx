import React, { useMemo } from 'react';
import { assertEcsComponents, hasEcsComponents } from '../../game/core/ecs/assert';
import { eventLogComponent } from '../../game/core/ecs/components/eventLogComponent';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { wealthComponent } from '../../game/core/ecs/components/wealthComponent';
import { useControlsContext } from '../contexts/ControlsContext';
import { Panel } from '../hud/atoms/Panel';
import EntityControls, { EntityControlsProps } from '../hud/EntityControls';
import { ErrorBoundary } from '../util/ErrorBoundary';
import { GameEntityIcon } from './GameEntityIcon';
import { GameEntityLastLog } from './phrases/GameEntityLastLog';

const NO_ENTITY_SELECTED_ENTITY = { id: 'no-entity-selected' };

/**
 * A component that maps the selected game entity to a presentational component.
 *
 * This component uses the {@link EntityControls} presentational component to display controls for the selected entity.
 */
const GameSelectedEntity: React.FC = () => {
	const { state, selectEntity } = useControlsContext();

	const selectedEntity = state.selectedEntity ?? NO_ENTITY_SELECTED_ENTITY;

	// Asserting the components here informs the TS language server what the types
	// are for the rest of the function. The function will not actually throw if an
	// "optional" component is missing.
	assertEcsComponents(
		selectedEntity,
		[],
		[visibilityComponent, locationComponent, wealthComponent],
	);

	const icon = useMemo(
		() => (
			<div style={{ fontSize: `${selectedEntity.iconSize ?? 0.4}em` }}>
				<GameEntityIcon entity={selectedEntity} />
			</div>
		),
		[selectedEntity],
	);

	const title = useMemo(() => {
		if (hasEcsComponents(selectedEntity, [visibilityComponent])) {
			return selectedEntity.name;
		}
		return '';
	}, [selectedEntity]);

	const subtitle = useMemo(() => {
		if (hasEcsComponents(selectedEntity, [visibilityComponent])) {
			return selectedEntity.description;
		}
		return '';
	}, [selectedEntity]);

	const entityInfo = useMemo(() => {
		const info = [{ key: 'Nerf', value: 'yes' as React.ReactNode }];

		if (hasEcsComponents(selectedEntity, [eventLogComponent])) {
			info[0].value = selectedEntity.events.get(0);
		}

		return info;
	}, [selectedEntity]);

	const tabs = useMemo(() => {
		const tabList: EntityControlsProps['tabs'] = [];

		// if (hasEcsComponents(selectedEntity, [inventoryComponent])) {
		// 	tabList.push({
		// 		label: 'Inventory',
		// 		Content: () => <InventoryTab entity={selectedEntity} />,
		// 	});
		// }
		// if (hasEcsComponents(selectedEntity, [pathingComponent])) {
		// 	tabList.push({
		// 		label: 'Pathing',
		// 		Content: () => <PathingTab entity={selectedEntity} />,
		// 	});
		// }

		return tabList;
	}, [selectedEntity]);

	return (
		<Panel data-component='GameSelectedEntity'>
			<ErrorBoundary>
				<EntityControls
					icon={icon}
					title={title}
					subtitle={<GameEntityLastLog entity={selectedEntity} />}
					entityInfo={entityInfo}
					tabs={tabs}
				/>
			</ErrorBoundary>
		</Panel>
	);
};

export { GameSelectedEntity };
