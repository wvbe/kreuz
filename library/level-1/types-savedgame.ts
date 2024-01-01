import { type SavePersonEntityJson } from './entities/entity.person.ts';
import { type SaveSettlementEntityJson } from './entities/entity.settlement.ts';
import { type SaveEventedValueJson } from './classes/EventedValue.ts';
import { type SaveTerrainJson } from './terrain/Terrain.ts';

type Location = [number, number, number];

export type SavedGameJson = {
	version: 'broken' | 'alpha' | 'beta-1';
	terrain: SaveTerrainJson;
	entities: Array<SaveSettlementEntityJson | SavePersonEntityJson>;
	time: SaveEventedValueJson;
	seed: string | number;
};

// A utility type to get the "P" in type "Array<P>"
type ArrayItem<Arr> = Arr extends Array<infer P> ? P : never;

export type SaveTimeJson = SavedGameJson['time'];
export type SaveTileJson = ArrayItem<SavedGameJson['terrain']['tiles']>;
