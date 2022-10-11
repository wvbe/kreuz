import { Coordinate } from '../classes/Coordinate.ts';
import { Random } from '../classes/Random.ts';
import { getRandomSettlementName } from '../constants/names.tsx';
import { RectangleParty } from '../generators/generateRectangles.ts';
import { CoordinateI, SeedI } from '../types.ts';
import { Entity } from './Entity.ts';
import { EntityI } from './types.ts';

export type SettlementParametersI = {
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};

function generateBuildings(
	seed: SeedI[],
	areaSize: number,
	minimumBuildingLength: number,
	scale: number,
) {
	const center = new Coordinate(areaSize / 2, areaSize / 2, 0);
	const root = RectangleParty.init(seed, areaSize, areaSize, {
		minimumBuildingLength: minimumBuildingLength,
	});

	return root
		.flatten()
		.map((rect) => ({
			rect,
			center: new Coordinate(rect.x + rect.w / 2, rect.y + rect.h / 2, 0),
		}))
		.map((obj) => ({
			...obj,
			dist: center.euclideanDistanceTo(obj.center),
		}))
		.sort((a, b) => a.dist - b.dist)
		.map(({ rect, center }, i) => {
			let size = (rect.w + rect.h) / 2;

			// Wether this building faces north/south or east/west
			const orientation = Random.boolean([...seed, 'orientation']);
			const baseHeight = Random.between(0.3 * size, 0.8 * size, ...seed, 'size', i);
			const jostle = {
				x: Random.between(areaSize / 1.8, areaSize / 2.2, ...seed, 'jx', i),
				y: Random.between(areaSize / 1.8, areaSize / 2.2, ...seed, 'jy', i),
			};
			return {
				baseWidth: (orientation ? rect.w : rect.h) * Random.between(0.3, 0.8, ...seed, 'length', 1),
				baseDepth: (orientation ? rect.h : rect.w) * Random.between(0.3, 0.8, ...seed, 'width', 1),
				baseHeight,
				roofHeight: Random.between(0.1 * baseHeight, 0.4 * baseHeight, ...seed, 'roof', i),
				rotateY:
					(orientation ? Math.PI / 2 : 0) + Random.between(-Math.PI, Math.PI, ...seed, 'rotate', i),
				translate: { x: center.x - jostle.x, y: center.y - jostle.y, z: center.z },
				scale,
			};
		});
}

export class SettlementEntity extends Entity implements EntityI {
	public readonly parameters: SettlementParametersI & {
		name: string;
	};

	public readonly buildings: ReturnType<typeof generateBuildings>;

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
		this.buildings = generateBuildings(
			[this.id],
			this.parameters.areaSize,
			this.parameters.minimumBuildingLength,
			this.parameters.scale,
		);
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
