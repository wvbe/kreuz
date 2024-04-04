import React, { useCallback, useMemo, useState } from 'react';

import { Blueprint, Material, PROMPT_CONSTRUCTION_JOB } from '@lib';
import { PromptModal } from './types.ts';
import { Modal } from '../modals/Modal.tsx';
import { Badge } from '../components/atoms/Badge.tsx';
import { Cell, Row, Table } from '../components/atoms/Table.tsx';
import { useGameContext } from '../context/GameContext.tsx';
import { InventoryBag } from '../inventory/InventoryUI.tsx';

export const EntityConstructionModal: PromptModal<typeof PROMPT_CONSTRUCTION_JOB> = ({
	onCancel,
	onSubmit: $onSubmit,
}) => {
	const game = useGameContext();
	const onSubmit = useCallback(() => {
		$onSubmit({
			entity: {
				id: 'ddddrrrrpppppptptpt',
			},
		});
	}, [$onSubmit]);

	const [buildingType, setBuildingType] = useState<'factory' | 'market-stall' | null>(null);
	const [buildingFocus, setBuildingFocus] = useState<Blueprint | Material | null>(null);

	const secondColumn = useMemo(() => {
		if (!buildingType) {
			return null;
		}
		if (buildingType === 'factory') {
			return (
				<Table>
					{game.assets.blueprints.toArray().map((blueprint) => (
						<Row onClick={() => setBuildingFocus(blueprint)}>
							<Cell>
								<Badge
									icon={blueprint.products[0].material.symbol}
									title={blueprint.name}
									subtitle={<InventoryBag stacks={blueprint.products} />}
								/>
							</Cell>
						</Row>
					))}
				</Table>
			);
		}
		if (buildingType === 'market-stall') {
			return (
				<Table>
					{game.assets.materials.toArray().map((material) => (
						<Row onClick={() => setBuildingFocus(material)}>
							<Cell>
								<Badge icon={material.symbol} title={material.label} subtitle={''} />
							</Cell>
						</Row>
					))}
				</Table>
			);
		}
	}, [buildingType]);
	return (
		<Modal onCancel={onCancel} onSubmit={onSubmit} title="What are we building today?">
			<div className="entity-construction-modal__column">
				<Table>
					<Row onClick={() => setBuildingType('factory')}>
						<Cell>
							<Badge icon={'🏭'} title="Factory" subtitle="Factories produce stuff" />
						</Cell>
					</Row>
					<Row onClick={() => setBuildingType('market-stall')}>
						<Cell>
							<Badge icon={'🏪'} title="Market stall" subtitle="Market stalls sell stuff" />
						</Cell>
					</Row>
				</Table>
			</div>
			<div className="entity-construction-modal__column">{secondColumn}</div>
		</Modal>
	);
};
