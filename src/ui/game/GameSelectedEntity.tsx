import React, { ReactNode, useEffect, useMemo } from 'react';
import { hasEcsComponents } from '../../game/core/ecs/assert';
import { healthComponent } from '../../game/core/ecs/components/healthComponent';
import { isMapLocationEqualTo } from '../../game/core/ecs/components/location/isMapLocationEqualTo';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { needsComponent } from '../../game/core/ecs/components/needsComponent';
import { pathingComponent } from '../../game/core/ecs/components/pathingComponent';
import { portalComponent } from '../../game/core/ecs/components/portalComponent';
import { rawMaterialComponent } from '../../game/core/ecs/components/rawMaterialComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { useGameContext } from '../contexts/GameContext';
import { Button } from '../hud/atoms/Button';
import { ButtonBar } from '../hud/atoms/ButtonBar';
import { EntityBadge } from '../hud/EntityBadge';
import { Gauge } from '../hud/Gauge';
import { setSelectedEntity, useSelectedEntityStore } from '../stores/selectedEntityStore';
import { setSelectedTerrain } from '../stores/selectedTerrainStore';
import { ErrorBoundary } from '../util/ErrorBoundary';
import { GameEntityIcon } from './GameEntityIcon';
import styles from './GameSelectedEntity.module.css';
import { GameEntityLastLog } from './phrases/GameEntityLastLog';

const NO_ENTITY_SELECTED_ENTITY = { id: 'no-entity-selected' };

const GameSelectedEntity: React.FC = () => {
	const game = useGameContext();
	const selectedEntity =
		useSelectedEntityStore((state) => state.selectedEntity) ?? NO_ENTITY_SELECTED_ENTITY;

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
			<div
				style={{
					fontSize: `${
						(selectedEntity as EcsEntity<typeof visibilityComponent>).iconSize ?? 0.4
					}em`,
				}}
			>
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

	const buttons = useMemo(() => {
		const buttons: ReactNode[] = [];
		if (hasEcsComponents(selectedEntity, [portalComponent])) {
			buttons.push(
				<Button
					layout='tile'
					icon='🚶‍♀️'
					onClick={() => {
						setSelectedTerrain(selectedEntity.portalDestinationTerrain);

						// Set the reverse portal to be the new selected entity
						const selectedTerrain = selectedEntity.location.get()[0];
						const portalBackLocation: QualifiedCoordinate = [
							selectedEntity.portalDestinationTerrain,
							...selectedEntity.portalDestinationTerrain.getLocationOfPortalToTerrain(
								selectedTerrain,
							),
						];
						setSelectedEntity(
							game.entities.find(
								(en) =>
									hasEcsComponents(en, [
										locationComponent,
										visibilityComponent,
									]) &&
									isMapLocationEqualTo(en.location.get(), portalBackLocation),
							) ?? null,
						);
					}}
				>
					Visit
				</Button>,
			);
		}
		if (hasEcsComponents(selectedEntity, [needsComponent])) {
			buttons.push(
				<Gauge eventedValue={selectedEntity.needs.nutrition} vertical label='🍗' />,
				<Gauge eventedValue={selectedEntity.needs.hydration} vertical label='💧' />,
			);
		}
		return buttons;
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
		if (hasEcsComponents(selectedEntity, [healthComponent])) {
			info.push({
				key: 'Health',
				value: <Gauge eventedValue={selectedEntity.health} />,
			});
		}

		return info;
	}, [selectedEntity]);

	return (
		<>
			<div className={styles.container}>
				{selectedEntity !== NO_ENTITY_SELECTED_ENTITY ? (
					<div style={{ width: 0 }}>
						<ErrorBoundary>
							<EntityBadge
								title={title}
								icon={icon}
								subtitle={<GameEntityLastLog entity={selectedEntity} />}
							/>
						</ErrorBoundary>
					</div>
				) : null}

				<ButtonBar
					style={{
						height: 'calc(4em + 1em + 0.5em)',
						minWidth: '16em',
						boxSizing: 'border-box',
					}}
				>
					<ErrorBoundary>{buttons.length > 0 ? buttons : null}</ErrorBoundary>
				</ButtonBar>
			</div>
		</>
	);
};

export { GameSelectedEntity };
