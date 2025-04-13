import { type Material } from '../../../inventory/Material';
import { type eventLogComponent } from '../../components/eventLogComponent';
import { type importExportComponent } from '../../components/importExportComponent';
import { type inventoryComponent } from '../../components/inventoryComponent';
import { type locationComponent } from '../../components/locationComponent';
import { EcsEntity } from '../../types';

export type LogisticsEntity = EcsEntity<
	typeof inventoryComponent | typeof locationComponent | typeof importExportComponent,
	typeof eventLogComponent
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
