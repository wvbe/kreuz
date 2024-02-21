import Game from '../Game.ts';
import { SaveJsonContext } from '../types-savedgame.ts';
import { SimpleCoordinate } from '../types.ts';
import { BuildingEntity, type SaveBuildingEntityJson } from './entity.building.ts';
import { EntityI } from './types.ts';

export type SaveChurchBuildingEntityJson = SaveBuildingEntityJson;

export class ChurchBuildingEntity extends BuildingEntity implements EntityI {
	public readonly type = 'church';

	constructor(id: string, location: SimpleCoordinate) {
		super(id, location, {
			baseDepth: 1,
			baseHeight: 1,
			baseWidth: 1,
			roofHeight: 1,
		});
	}

	public get name() {
		return 'Church';
	}

	public get icon() {
		return '💒';
	}

	public static async fromSaveJson(
		_context: SaveJsonContext,
		save: SaveChurchBuildingEntityJson,
	): Promise<ChurchBuildingEntity> {
		const { id, location } = save;
		const inst = new ChurchBuildingEntity(id, location);
		return inst;
	}
}
