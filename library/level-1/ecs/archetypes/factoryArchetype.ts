import { type SimpleCoordinate } from '../../terrain/types.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { importExportComponent } from '../components/importExportComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { ownerComponent } from '../components/ownerComponent.ts';
import { productionComponent } from '../components/productionComponent.ts';
import { Blueprint } from '../components/productionComponent/Blueprint.ts';
import { eventLogComponent } from '../components/eventLogComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { EcsEntity } from '../types.ts';
import { Random } from '../../classes/Random.ts';

export const factoryArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>;
		blueprint: Blueprint;
		maxWorkers: number;
		maxStackSpace: number;
		name?: string;
		icon?: string;
	},
	| typeof eventLogComponent
	| typeof importExportComponent
	| typeof inventoryComponent
	| typeof locationComponent
	| typeof ownerComponent
	| typeof productionComponent
	| typeof visibilityComponent
>(
	[
		eventLogComponent,
		importExportComponent,
		inventoryComponent,
		locationComponent,
		ownerComponent,
		productionComponent,
		visibilityComponent,
	],
	(entity, options) => {
		inventoryComponent.attach(entity, {
			maxStackSpace: options.maxStackSpace,
		});
		locationComponent.attach(entity, {
			location: options.location,
		});
		ownerComponent.attach(entity, {
			owner: options.owner,
		});
		eventLogComponent.attach(entity, {});
		productionComponent.attach(entity, {
			maxWorkers: options.maxWorkers,
			blueprint: options.blueprint,
		});
		visibilityComponent.attach(entity, {
			icon: options.icon ?? '🏭',
			name: options.name ?? 'Factory',
		});
		importExportComponent.attach(entity, {
			requestMaterialsWhenBelow: options.blueprint.ingredients.map(({ material, quantity }) => ({
				material,
				quantity: quantity * 5,
			})),
			provideMaterialsWhenAbove: options.blueprint.products.map(({ material, quantity }) => ({
				material,
				quantity: 0, //quantity * 5,
			})),
		});
	},
);

export async function createFactoryForBlueprint(
	blueprint: Blueprint,
	owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>,
	location: SimpleCoordinate,
) {
	const factory = factoryArchetype.create({
		blueprint,
		location,
		owner,
		icon: blueprint.products[0].material.symbol,
		maxStackSpace: 8,
		maxWorkers: 1 * blueprint.options.workersRequired,
		name: blueprint.options.buildingName,
	});
	await Promise.all([
		...blueprint.ingredients.map(async ({ material }) => {
			await factory.inventory.set(
				material,
				Math.round(material.stack * Random.between(0.2, 1, factory.id)),
			);
		}),
		...blueprint.products.map(async ({ material }) => {
			await factory.inventory.set(
				material,
				Math.round(material.stack * Random.between(0.2, 1, factory.id)),
			);
		}),
	]);
	return factory;
}
