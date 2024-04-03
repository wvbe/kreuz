import { EcsEntity, productionComponent } from '@lib';
import React, { FunctionComponent } from 'react';
import { BlueprintInputOutput } from '../../components/BlueprintInputOutput.tsx';
import { useGameContext } from '../../context/GameContext.tsx';
import { useEventedValue } from '../../hooks/useEventedValue.ts';
import { useNavigation } from '../../hooks/useNavigation.ts';
import { ROUTE_PRODUCTION_DETAILS } from '../../routes/ROUTES.ts';

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
					throw new Error('Had expected the clickhandler on a blueprint to have a blueprint');
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
