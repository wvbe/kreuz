import { type inventoryComponent } from '../../components/inventoryComponent.ts';
import { type locationComponent } from '../../components/locationComponent.ts';
import { type importExportComponent } from '../../components/importExportComponent.ts';
import { EcsEntity } from '../../types.ts';
import { type Material } from '../../../inventory/Material.ts';

export type TradeFlowEntity = EcsEntity<
	typeof inventoryComponent | typeof locationComponent | typeof importExportComponent
>;

export type TradeFlowOffer<EntityGeneric extends EcsEntity = TradeFlowEntity> = {
	entity: EntityGeneric;
	quantityOnOffer: number;
};

export type TradeFlowDeal<EntityGeneric extends EcsEntity = TradeFlowEntity> = {
	supplier: EntityGeneric;
	destination: EntityGeneric;
	material: Material;
	quantity: number;
};
