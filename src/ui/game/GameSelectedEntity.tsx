import React, { ReactNode, useEffect, useMemo } from 'react';
import { assertEcsComponents, hasEcsComponents } from '../../game/core/ecs/assert';
import { healthComponent } from '../../game/core/ecs/components/healthComponent';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { needsComponent } from '../../game/core/ecs/components/needsComponent';
import { pathingComponent } from '../../game/core/ecs/components/pathingComponent';
import { portalComponent } from '../../game/core/ecs/components/portalComponent';
import { rawMaterialComponent } from '../../game/core/ecs/components/rawMaterialComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { wealthComponent } from '../../game/core/ecs/components/wealthComponent';
import { Button } from '../hud/atoms/Button';
import { Panel } from '../hud/atoms/Panel';
import EntityControls, { EntityControlsProps } from '../hud/EntityControls';
import { Gauge } from '../hud/Gauge';
import { useSelectedEntityStore } from '../stores/selectedEntityStore';
import { setSelectedTerrain } from '../stores/selectedTerrainStore';
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
	const selectedEntity =
		useSelectedEntityStore((state) => state.selectedEntity) ?? NO_ENTITY_SELECTED_ENTITY;

	// Asserting the components here informs the TS language server what the types
	// are for the rest of the function. The function will not actually throw if an
	// "optional" component is missing.
	assertEcsComponents(
		selectedEntity,
		[],
		[visibilityComponent, locationComponent, wealthComponent],
	);

	// Whenever the selected entity walks into another terrain, camera follows to the same terrain
	useEffect(() => {
		if (!hasEcsComponents(selectedEntity, [pathingComponent])) {
			return;
		}
		return selectedEntity.$portalExited.on((portal) => {
			setSelectedTerrain(portal.terrain);
		});
	}, [selectedEntity]);

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

	const entityInfo = useMemo(() => {
		const info: { key: string; value: string | ReactNode }[] = [
			{ key: 'ID', value: selectedEntity.id },
		];

		// if (hasEcsComponents(selectedEntity, [eventLogComponent])) {
		// 	info.push({ key: 'Status', value: <GameEventedValue eventedValue={selectedEntity.events.get(0)} /> });
		// }
		if (hasEcsComponents(selectedEntity, [portalComponent])) {
			info.push({
				key: 'Destination',
				value: (
					<Button
						layout='small'
						onClick={() => {
							setSelectedTerrain(selectedEntity.portalDestinationTerrain);
						}}
					>
						Visit
					</Button>
				),
			});
		}
		if (hasEcsComponents(selectedEntity, [rawMaterialComponent])) {
			info.push(
				...selectedEntity.rawMaterials.map((rawMaterial) => ({
					key: rawMaterial.material.label,
					value: <Gauge eventedValue={rawMaterial.quantity} />,
				})),
			);
		}
		if (hasEcsComponents(selectedEntity, [needsComponent])) {
			info.push({
				key: 'Health',
				value: (
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							gap: '0.25em',
							height: '3em',
						}}
					>
						<Gauge eventedValue={selectedEntity.needs.nutrition} vertical />
						<Gauge eventedValue={selectedEntity.needs.hydration} vertical />
					</div>
				),
			});
		}
		if (hasEcsComponents(selectedEntity, [healthComponent])) {
			info.push({
				key: 'Health',
				value: <Gauge eventedValue={selectedEntity.health} />,
			});
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
					key={selectedEntity.id}
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
