import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { productionComponent } from 'src/lib/level-1/ecs/components/productionComponent';
import { visibilityComponent } from 'src/lib/level-1/ecs/components/visibilityComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';
import { Badge } from '../components/atoms/Badge';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow';
import { BlueprintInputOutput } from '../components/BlueprintInputOutput';
import { useEntitiesWithBlueprint } from '../components/useFactoriesWithBlueprint';
import { useGameContext } from '../context/GameContext';
import { EntityLink } from '../entities/EntityLink';
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
							): entity is EcsEntity<
								typeof productionComponent | typeof visibilityComponent
							> => visibilityComponent.test(entity),
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
