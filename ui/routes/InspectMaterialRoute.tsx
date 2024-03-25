import React, { FunctionComponent, useMemo } from 'react';

import { useParams } from 'react-router-dom';
import { Badge } from '../components/atoms/Badge.tsx';
import { CollapsibleWindow } from '../components/atoms/CollapsibleWindow.tsx';
import { useGameContext } from '../context/GameContext.tsx';
import { FillBar } from '../components/atoms/FillBar.tsx';
import { useNavigation } from '../hooks/useNavigation.ts';

import { PERSON_NEEDS } from '@lib';
import { ROUTE_PRODUCTION_DETAILS } from './ROUTES.ts';
import { Game, Material } from '@lib';

function createListItemsForMaterialToBlueprintRelationship(
	game: Game,
	material: Material,
	relationship: 'ingredients' | 'products',
	navigate: ReturnType<typeof useNavigation>,
) {
	return game.assets.blueprints
		.toArray()
		.filter((blueprint) => blueprint[relationship].some((state) => state.material === material))
		.map((blueprint, i) => (
			<li key={i}>
				<a
					href="#"
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						navigate(ROUTE_PRODUCTION_DETAILS, {
							blueprintId: game.assets.blueprints.key(blueprint),
						});
					}}
				>
					{blueprint.name}
				</a>
			</li>
		));
}
export const InspectMaterialRoute: FunctionComponent = () => {
	const { materialId } = useParams<{ materialId: string }>();
	const game = useGameContext();
	const navigate = useNavigation();
	const material = useMemo(() => game.assets.materials.get(materialId!), [materialId]);
	if (!material) {
		return null;
	}
	const materialAsIngredient = useMemo(
		() =>
			createListItemsForMaterialToBlueprintRelationship(game, material, 'ingredients', navigate),
		[material],
	);
	const materialAsProduct = useMemo(
		() => createListItemsForMaterialToBlueprintRelationship(game, material, 'products', navigate),
		[material],
	);

	return (
		<CollapsibleWindow label={`Details panel`} initiallyOpened>
			<Badge icon={material.symbol} title={material.label} subtitle={material.value} />

			<FillBar
				ratio={material.hydration}
				label={`${PERSON_NEEDS.find((need) => need.id === 'hydration')!.label} Hydration`}
				labelRight={`${material.hydration * 100}%`}
			/>
			<FillBar
				ratio={material.nutrition}
				label={`${PERSON_NEEDS.find((need) => need.id === 'nutrition')!.label} Nutrition`}
				labelRight={`${material.nutrition * 100}%`}
			/>
			<FillBar
				ratio={material.toxicity}
				label={`☠️ Toxicity`}
				labelRight={`${material.toxicity * 100}%`}
			/>

			{materialAsProduct.length ? (
				<>
					<p>Produced with the following blueprints:</p>
					<ul>{materialAsProduct}</ul>
				</>
			) : null}
			{materialAsIngredient.length ? (
				<>
					<p>Used as an ingredient in the following blueprints:</p>
					<ul>{materialAsIngredient}</ul>
				</>
			) : null}
		</CollapsibleWindow>
	);
};
