import React, { useCallback, useMemo, useState } from 'react';

import { factoryArchetype } from '../../lib/level-1/ecs/archetypes/factoryArchetype';
import { marketArchetype } from '../../lib/level-1/ecs/archetypes/marketArchetype';
import { EcsArchetype } from '../../lib/level-1/ecs/classes/EcsArchetype';
import { Blueprint } from '../../lib/level-1/ecs/components/productionComponent/Blueprint';
import { Material } from '../../lib/level-1/inventory/Material';
import { PROMPT_CONSTRUCTION_JOB } from '../../lib/level-2/commands/constructEntity';
import { useGameContext } from '../../ui2/contexts/GameContext';
import { Badge } from '../components/atoms/Badge';
import { Cell, Row, Table } from '../components/atoms/Table';
import { InventoryBag } from '../inventory/InventoryUI';
import { Modal } from '../modals/Modal';
import { PromptModal } from './types';

const buildingTypes = [
	{
		archetype: factoryArchetype,
		icon: '🏭',
		title: 'Factory',
		subtitle: 'Factories produce stuff',
	},
	{
		archetype: marketArchetype,
		icon: '🏪',
		title: 'Market stall',
		subtitle: 'Market stalls sell stuff',
	},
] as const;

export const EntityConstructionModal: PromptModal<typeof PROMPT_CONSTRUCTION_JOB> = ({
	onCancel,
	onSubmit: $onSubmit,
}) => {
	const [buildingType, setBuildingType] = useState<EcsArchetype<any, any> | null>(null);
	const [buildingFocus, setBuildingFocus] = useState<Blueprint | Material | null>(null);
	const game = useGameContext();
	const canSubmit = useMemo(
		() => buildingType !== null && buildingFocus !== null,
		[buildingType, buildingFocus],
	);
	const onSubmit = useCallback(() => {
		if (!canSubmit) {
			return;
		}
		$onSubmit({
			buildingType: buildingType!,
			buildingFocus: buildingFocus!,
		});
	}, [$onSubmit, canSubmit]);

	const secondColumn = useMemo(() => {
		if (!buildingType) {
			return null;
		}
		if (buildingType === factoryArchetype) {
			return (
				<Table>
					{game.assets.blueprints.toArray().map((blueprint, index) => (
						<Row
							key={index}
							onClick={() => setBuildingFocus(blueprint)}
							aria-selected={buildingFocus === blueprint}
						>
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
		if (buildingType === marketArchetype) {
			return (
				<Table>
					{game.assets.materials.toArray().map((material, index) => (
						<Row
							key={index}
							onClick={() => setBuildingFocus(material)}
							aria-selected={buildingFocus === material}
						>
							<Cell>
								<Badge
									icon={material.symbol}
									title={material.label}
									subtitle={''}
								/>
							</Cell>
						</Row>
					))}
				</Table>
			);
		}
	}, [buildingType, buildingFocus]);
	return (
		<Modal
			onCancel={onCancel}
			onSubmit={onSubmit}
			canSubmit={canSubmit}
			title='What are we building today?'
		>
			<div className='entity-construction-modal__column'>
				<Table>
					{buildingTypes.map((type, index) => (
						<Row
							key={index}
							onClick={() => setBuildingType(type.archetype)}
							aria-selected={buildingType === type.archetype}
						>
							<Cell>
								<Badge
									icon={type.icon}
									title={type.title}
									subtitle={type.subtitle}
								/>
							</Cell>
						</Row>
					))}
				</Table>
			</div>
			<div className='entity-construction-modal__column'>{secondColumn}</div>
		</Modal>
	);
};
