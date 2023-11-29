import { SaveEntityJson } from '../types-savedgame.ts';
import { ChurchBuildingEntity } from './entity.building.church.ts';
import { FactoryBuildingEntity } from './entity.building.factory.ts';
import { MarketBuildingEntity } from './entity.building.market.ts';
import { PersonEntity, type SavePersonEntityJson } from './entity.person.ts';
import { type SaveSettlementEntityJson, SettlementEntity } from './entity.settlement.ts';

export function castSaveJsonToEntity(save: SaveSettlementEntityJson | SavePersonEntityJson) {
	switch (save.type) {
		case 'person':
			return PersonEntity.fromSaveJson(save);
		case 'settlement':
			return SettlementEntity.fromSaveJson(save);
		// case 'church':
		// 	return ChurchBuildingEntity.fromSaveJson(save);
		// case 'factory':
		// 	return FactoryBuildingEntity.fromSaveJson(save);
		// case 'market-stall':
		// 	return MarketBuildingEntity.fromSaveJson(save);
		default:
			throw new Error('Unsupported entity save object');
	}
}
