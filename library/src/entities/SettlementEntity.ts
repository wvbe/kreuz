import { getRandomSettlementName } from '../constants/names.tsx';
import { CoordinateI } from '../types.ts';
import { Entity } from './Entity.ts';
import { EntityI } from './types.ts';

export type SettlementParametersI = {
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};

export class SettlementEntity extends Entity implements EntityI {
	public readonly parameters: SettlementParametersI & {
		name: string;
	};

	// @TODO proper implementation of BuildingI and CollectionI
	public readonly buildings: never[];

	/**
	 * @deprecated not used yet.
	 */
	public type = 'settlement';

	constructor(id: string, location: CoordinateI, parameters: SettlementParametersI) {
		super(id, location);
		this.parameters = {
			...parameters,
			name: getRandomSettlementName([this.id]),
		};
		this.buildings = []; // generateBuildings(
		// 	[this.id],
		// 	this.parameters.areaSize,
		// 	this.parameters.minimumBuildingLength,
		// 	this.parameters.scale,
		// );
	}

	public get label(): string {
		return this.parameters.name;
	}

	public get title() {
		return `Town of ${Math.round(this.parameters.areaSize * 1000)} souls.`;
	}

	// protected createGeometries() {
	// 	return this.buildings.map(
	// 		({ baseWidth, baseDepth, baseHeight, roofHeight, rotateY, translate, scale }) => {
	// 			const geo = BuildingEntity.createGeometry({
	// 				baseWidth,
	// 				baseDepth,
	// 				baseHeight,
	// 				roofHeight,
	// 			});
	// 			geo.rotateY(rotateY);
	// 			const center = convertCoordinate(translate);
	// 			geo.translate(center.x, center.y, center.z);
	// 			geo.scale(scale, scale, scale);
	// 			return geo;
	// 		},
	// 	);
	// }
}
