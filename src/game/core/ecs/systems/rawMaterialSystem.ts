import { byEcsComponents } from '../assert';
import { EcsSystem } from '../classes/EcsSystem';
import { rawMaterialComponent } from '../components/rawMaterialComponent';

export const rawMaterialSystem = new EcsSystem(async (game) => {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(byEcsComponents([rawMaterialComponent]))
				.flatMap((entity) => entity.rawMaterials)
				.map((rawMaterial) => rawMaterial.quantity.attach(game)),
		);
	});
});
