import { Material } from '../../inventory/Material.ts';
import { SimpleCoordinate } from '../../types.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { ownerComponent } from '../components/ownerComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { vendorComponent } from '../components/vendorComponent.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { EcsEntity } from '../types.ts';
import { importExportComponent } from '../components/importExportComponent.ts';

export const marketArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>;
		materials: Material[];
		maxStackSpace: number;
		name?: string;
		icon?: string;
	},
	| typeof inventoryComponent
	| typeof locationComponent
	| typeof ownerComponent
	| typeof importExportComponent
	| typeof vendorComponent
	| typeof visibilityComponent
>(
	[
		inventoryComponent,
		locationComponent,
		ownerComponent,
		vendorComponent,
		importExportComponent,
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
		visibilityComponent.attach(entity, {
			icon: options.icon ?? '🏪',
			name: options.name ?? 'Market',
		});
		importExportComponent.attach(entity, {
			provideMaterialsWhenAbove: [],
			requestMaterialsWhenBelow: options.materials.map((material) => ({
				material,
				quantity: Math.round(
					material.stack * (options.maxStackSpace / options.materials.length) * 0.8,
				),
			})),
		});
		vendorComponent.attach(entity, {
			sellMaterialsWhenAbove: options.materials.map((material) => ({
				material,
				quantity: 0,
			})),
			profitMargin: 0.1,
		});
	},
);
