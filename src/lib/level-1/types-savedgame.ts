import { GameAssets } from './Game';
import { type SaveEventedValueJson } from './events/EventedValue';

type Location = [number, number, number];

export type SavedGameJson = {
	version: 'broken' | 'alpha' | 'beta-1';
	// terrain: SaveTerrainJson;
	// entities: Array<SaveSettlementEntityJson | SavePersonEntityJson>;
	time: SaveEventedValueJson;
	seed: string | number;
};

/**
 * Coincidentially, the only context needed to save/load games is the asset registries precisely
 * as they also live on Game#assets, see {@link GameAssets}
 */
export type SaveJsonContext = { [key: string]: never };

// A utility type to get the "P" in type "Array<P>"
type ArrayItem<Arr> = Arr extends Array<infer P> ? P : never;

export type SaveTimeJson = SavedGameJson['time'];
export type SaveTileJson = unknown; //ArrayItem<SavedGameJson['terrain']['tiles']>;
