import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { useGameContext } from '../context/GameContext.tsx';
import { EntityDetails } from '../entities/EntityDetails.tsx';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';

import { InventoryBag } from '../inventory/InventoryUI.tsx';
import { Badge } from '../components/atoms/Badge.tsx';
import { GameNavigation, GameNavigationButton } from '../application/GameNavigation.tsx';
import { BlueprintBadge } from '../components/BlueprintBadge.tsx';

export const InspectBlueprintRoute: FunctionComponent = () => {
	const { blueprintId } = useParams<{ blueprintId: string }>();
	const game = useGameContext();
	const blueprint = useMemo(
		() => (blueprintId ? game.assets.blueprints.item(blueprintId) : null),
		[blueprintId],
	);
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
				<BlueprintBadge blueprint={blueprint} />
			</CollapsibleWindow>
			{/* {entity.type === 'person' ? (
				<GameNavigation>
					<GameNavigationButton
						symbol="💰"
						path={ROUTE_ENTITIES_PEOPLE_TRADE_DETAILS}
						params={{ entityId: entity.id }}
						tooltip="Trade"
					/>
					<GameNavigationButton
						symbol="👔"
						path={ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS}
						params={{ entityId: entity.id }}
						tooltip="Jobs"
					/>
				</GameNavigation>
			) : null} */}
		</>
	);
};
