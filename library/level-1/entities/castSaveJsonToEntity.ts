import Game from '../Game.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
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

export async function castSaveJsonToEntity(
	context: SaveJsonContext,
	save:
		| SaveSettlementEntityJson
		| SavePersonEntityJson
		| SaveFactoryBuildingEntityJson
		| SaveMarketBuildingEntityJson
		| SaveChurchBuildingEntityJson,
) {
	switch (save.type) {
		case 'person':
			return PersonEntity.fromSaveJson(context, save as SavePersonEntityJson);
		case 'settlement':
			return SettlementEntity.fromSaveJson(context, save as SaveSettlementEntityJson);
		case 'church':
			return ChurchBuildingEntity.fromSaveJson(context, save as SaveChurchBuildingEntityJson);
		case 'factory':
			return FactoryBuildingEntity.fromSaveJson(context, save as SaveFactoryBuildingEntityJson);
		case 'market-stall':
			return MarketBuildingEntity.fromSaveJson(context, save as SaveMarketBuildingEntityJson);
	}
	throw new Error(`Unsupported entity type "${save.type}" for save JSON`);
}
