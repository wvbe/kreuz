import React, { ReactNode, useMemo } from 'react';
import { hasEcsComponents } from '../../game/core/ecs/assert';
import { eventLogComponent } from '../../game/core/ecs/components/eventLogComponent';
import { healthComponent } from '../../game/core/ecs/components/healthComponent';
import { isMapLocationEqualTo } from '../../game/core/ecs/components/location/isMapLocationEqualTo';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { needsComponent } from '../../game/core/ecs/components/needsComponent';
import { portalComponent } from '../../game/core/ecs/components/portalComponent';
import { rawMaterialComponent } from '../../game/core/ecs/components/rawMaterialComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { useGameContext } from '../contexts/GameContext';
import { useModalOpener } from '../hooks/useModalOpener';
import { Button } from '../hud/atoms/Button';
import { ButtonBar } from '../hud/atoms/ButtonBar';
import { EntityBadge } from '../hud/EntityBadge';
import { Gauge } from '../hud/Gauge';
import { EventLogViewer } from '../modals/EventLogViewer';
import { setSelectedEntity, useSelectedEntityStore } from '../stores/selectedEntityStore';
import { setSelectedTerrain } from '../stores/selectedTerrainStore';
import { ErrorBoundary } from '../util/ErrorBoundary';
import styles from './GameSelectedEntityControls.module.css';
import { GameEntityLastLog } from './phrases/GameEntityLastLog';

const NO_ENTITY_SELECTED_ENTITY = { id: 'no-entity-selected' };

const GameSelectedEntityControls: React.FC = () => {
	const game = useGameContext();
	const selectedEntity =
		useSelectedEntityStore((state) => state.selectedEntity) ?? NO_ENTITY_SELECTED_ENTITY;

	const title = useMemo(() => {
		if (hasEcsComponents(selectedEntity, [visibilityComponent])) {
			return selectedEntity.name;
		}
		return 'Anonymous';
	}, [selectedEntity]);

	const openEventLogModal = useModalOpener(EventLogViewer);

	const buttons = useMemo(() => {
		const buttons: ReactNode[] = [];
		if (hasEcsComponents(selectedEntity, [eventLogComponent])) {
			buttons.push(
				<Button
					layout='tile'
					icon='📜'
					onClick={() =>
						openEventLogModal({
							title: `${title}'s Chronicles`,
							props: {
								entity: selectedEntity,
								onClose: () => {},
							},
						})
					}
				>
					Chronicles
				</Button>,
			);
		}
		if (hasEcsComponents(selectedEntity, [portalComponent])) {
			const onClick = () => {
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
							hasEcsComponents(en, [locationComponent, visibilityComponent]) &&
							isMapLocationEqualTo(en.location.get(), portalBackLocation),
					) ?? null,
				);
			};
			buttons.push(
				<Button layout='tile' icon='🚶‍♀️' onClick={onClick}>
					Visit
				</Button>,
			);
		}

		if (hasEcsComponents(selectedEntity, [needsComponent])) {
			buttons.push(
				<Gauge eventedValue={selectedEntity.needs.nutrition} vertical label='🍗' />,
				// <Gauge eventedValue={selectedEntity.needs.hydration} vertical label='💧' />,
			);
		}
		if (hasEcsComponents(selectedEntity, [rawMaterialComponent])) {
			buttons.push(
				selectedEntity.rawMaterials.map((rawMaterial) => (
					<Gauge
						key={rawMaterial.material.label}
						eventedValue={rawMaterial.quantity}
						vertical
						label={rawMaterial.material.symbol}
					/>
				)),
			);
		}
		if (hasEcsComponents(selectedEntity, [healthComponent])) {
			buttons.push(<Gauge eventedValue={selectedEntity.health} vertical label='💙' />);
		}
		return buttons;
	}, [selectedEntity, title]);

	return (
		<div className={styles.container}>
			{selectedEntity !== NO_ENTITY_SELECTED_ENTITY ? (
				<div className={styles.info}>
					<ErrorBoundary>
						<EntityBadge
							title={title}
							hideIcon
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
	);
};

export { GameSelectedEntityControls as GameSelectedEntity };
