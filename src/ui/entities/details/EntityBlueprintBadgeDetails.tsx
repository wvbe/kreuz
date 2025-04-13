import React, { FunctionComponent } from 'react';
import { productionComponent } from 'src/lib/level-1/ecs/components/productionComponent';
import { EcsEntity } from 'src/lib/level-1/ecs/types';
import { BlueprintInputOutput } from '../../components/BlueprintInputOutput';
import { useGameContext } from '../../context/GameContext';
import { useEventedValue } from '../../hooks/useEventedValue';
import { useNavigation } from '../../hooks/useNavigation';
import { ROUTE_PRODUCTION_DETAILS } from '../../routes/ROUTES';

export const EntityBlueprintBadgeDetails: FunctionComponent<{
	entity: EcsEntity;
}> = ({ entity }) => {
	const $blueprint = (entity as EcsEntity<typeof productionComponent>).blueprint;
	if (!$blueprint) {
		return null;
	}

	const blueprint = useEventedValue($blueprint);
	const navigate = useNavigation();
	const game = useGameContext();

	return (
		<BlueprintInputOutput
			blueprint={blueprint}
			onClick={(event) => {
				if (!blueprint) {
					throw new Error(
						'Had expected the clickhandler on a blueprint to have a blueprint',
					);
				}
				event.preventDefault();
				event.stopPropagation();
				navigate(ROUTE_PRODUCTION_DETAILS, {
					blueprintId: game.assets.blueprints.key(blueprint),
				});
			}}
		/>
	);
};
