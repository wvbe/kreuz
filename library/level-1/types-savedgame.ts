import { type SavePersonEntityJson } from './entities/entity.person.ts';
import { type SaveSettlementEntityJson } from './entities/entity.settlement.ts';

type Location = [number, number, number];

export type SavedGameJson = {
	version: 'broken' | 'alpha' | 'beta-1';
	terrain: {
		tiles: Array<{
			center: Location;
			outline: Location[];
			ghost: boolean;
		}>;
		size: number;
	};
	entities: Array<SaveSettlementEntityJson | SavePersonEntityJson>;
	time: {};
	seed: string | number;
};

// A utility type to get the "P" in type "Array<P>"
type ArrayItem<Arr> = Arr extends Array<infer P> ? P : never;

export type SaveTimeJson = SavedGameJson['time'];
export type SaveTerrainJson = SavedGameJson['terrain'];
export type SaveTileJson = ArrayItem<SavedGameJson['terrain']['tiles']>;

export type SaveEntityJson<Type extends string = string> = {
	type: Type;
	id: string;
	location: Location;
};
