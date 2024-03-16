import { type inventoryComponent } from '../../components/inventoryComponent.ts';
import { type locationComponent } from '../../components/locationComponent.ts';
import { type importExportComponent } from '../../components/importExportComponent.ts';
import { EcsEntity } from '../../types.ts';
import { type Material } from '../../../inventory/Material.ts';

export type LogisticsEntity = EcsEntity<
	typeof inventoryComponent | typeof locationComponent | typeof importExportComponent
>;

export type LogisticsOffer<EntityGeneric extends EcsEntity = LogisticsEntity> = {
	entity: EntityGeneric;
	quantityOnOffer: number;
};

export type LogisticsDeal<EntityGeneric extends EcsEntity = LogisticsEntity> = {
	supplier: EntityGeneric;
	destination: EntityGeneric;
	material: Material;
	quantity: number;
};
