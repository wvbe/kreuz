import { byEcsComponents } from '../assert';
import { EcsSystem } from '../classes/EcsSystem';
import { rawMaterialComponent } from '../components/rawMaterialComponent';
import { visibilityComponent } from '../components/visibilityComponent';

export const rawMaterialSystem = new EcsSystem(async (game) => {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(byEcsComponents([rawMaterialComponent]))
				.flatMap((entity) => entity.rawMaterials)
				.map(async (rawMaterial) => {
					// Make the ProgressingNumericValue start progressing
					await rawMaterial.quantity.attach(game);
				}),
		);

		entities
			.filter(byEcsComponents([rawMaterialComponent, visibilityComponent]))
			.forEach((entity) => {
				entity.rawMaterials.forEach((rawMaterial) => {
					rawMaterial.quantity.onBelow(
						rawMaterial.minimumRatioToHarvest,
						async () => entity.isVisible.set(false),
						false,
					);
					rawMaterial.quantity.onAbove(
						rawMaterial.minimumRatioToHarvest,
						async () => entity.isVisible.set(true),
						true,
					);
					entity.isVisible.set(
						rawMaterial.quantity.get() > rawMaterial.minimumRatioToHarvest,
					);
				});
			});
	});

	game.entities.$remove.on(async (entities) => {
		await Promise.all(
			entities
				.filter(byEcsComponents([rawMaterialComponent]))
				.flatMap((entity) => entity.rawMaterials)
				.map(async (rawMaterial) => {
					await rawMaterial.quantity.detach();
				}),
		);
	});
});
