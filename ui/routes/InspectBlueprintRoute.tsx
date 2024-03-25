import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext.tsx';
import { EntityDetails } from '../entities/EntityDetails.tsx';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';

import { InventoryBag } from '../inventory/InventoryUI.tsx';
import { Badge } from '../components/atoms/Badge.tsx';
import { GameNavigation, GameNavigationButton } from '../application/GameNavigation.tsx';
import { BlueprintInputOutput } from '../components/BlueprintInputOutput.tsx';
import { useEntitiesWithBlueprint } from '../components/useFactoriesWithBlueprint.ts';
import { EntityLink } from '../entities/EntityLink.tsx';
import { EcsEntity, productionComponent, visibilityComponent } from '@lib';

export const InspectBlueprintRoute: FunctionComponent = () => {
	const { blueprintId } = useParams<{ blueprintId: string }>();
	const game = useGameContext();
	const blueprint = useMemo(
		() => (blueprintId ? game.assets.blueprints.get(blueprintId) : null),
		[blueprintId],
	);
	const entities = useEntitiesWithBlueprint(blueprint);
	if (!blueprint) {
		return null;
	}

	return (
		<>
			<CollapsibleWindow label={`Details panel`} initiallyOpened>
				<Badge
					icon={blueprint.products[0].material.symbol}
					title={blueprint.name}
					subtitle={`${(blueprint.options.fullTimeEquivalent / 1000).toFixed(
						1,
					)} hours per production cycle`}
				/>
				<BlueprintInputOutput blueprint={blueprint} />
				<ul>
					{entities
						.filter(
							(
								entity,
							): entity is EcsEntity<typeof productionComponent | typeof visibilityComponent> =>
								visibilityComponent.test(entity),
						)
						.map((f) => (
							<li key={f.id}>
								<EntityLink entity={f} />
							</li>
						))}
				</ul>
			</CollapsibleWindow>
		</>
	);
};
