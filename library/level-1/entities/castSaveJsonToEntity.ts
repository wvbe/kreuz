import {
	ChurchBuildingEntity,
	type SaveChurchBuildingEntityJson,
} from './entity.building.church.ts';
import {
	FactoryBuildingEntity,
	type SaveFactoryBuildingEntityJson,
} from './entity.building.factory.ts';
import {
	MarketBuildingEntity,
	type SaveMarketBuildingEntityJson,
} from './entity.building.market.ts';
import { PersonEntity, type SavePersonEntityJson } from './entity.person.ts';
import { type SaveSettlementEntityJson, SettlementEntity } from './entity.settlement.ts';

export function castSaveJsonToEntity(
	save:
		| SaveSettlementEntityJson
		| SavePersonEntityJson
		| SaveFactoryBuildingEntityJson
		| SaveMarketBuildingEntityJson
		| SaveChurchBuildingEntityJson,
) {
	switch (save.type) {
		case 'person':
			return PersonEntity.fromSaveJson(save as SavePersonEntityJson);
		case 'settlement':
			return SettlementEntity.fromSaveJson(save as SaveSettlementEntityJson);
		case 'church':
			return ChurchBuildingEntity.fromSaveJson(save as SaveChurchBuildingEntityJson);
		case 'factory':
			return FactoryBuildingEntity.fromSaveJson(save as SaveFactoryBuildingEntityJson);
		case 'market-stall':
			return MarketBuildingEntity.fromSaveJson(save as SaveMarketBuildingEntityJson);
		default:
			throw new Error(`Unsupported entity type "${save.type}" for save JSON`);
	}
}
