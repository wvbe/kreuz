type Location = [number, number, number];

export type AnyJson =
	| string
	| number
	| boolean
	| {
			[x: string]: AnyJson;
	  }
	| Array<AnyJson>;

export interface SaveableObject<Json extends AnyJson> {
	serializeToSaveJson(): Json;
}
