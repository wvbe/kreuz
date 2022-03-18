import { Coordinate } from '../classes/Coordinate';
import { Random } from '../classes/Random';
import { getRandomSettlementName } from '../constants/names';
import { convertCoordinate } from '../rendering/threejs/utils';
import { RectangleParty } from '../scenarios/generators/generateRectangles';
import { CoordinateI, EntityI } from '../types';
import { BuildingEntity } from './BuildingEntity';
import { Entity } from './Entity';

export type SettlementParametersI = {
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};

export class SettlementEntity extends Entity implements EntityI {
	public readonly parameters: SettlementParametersI & {
		name: string;
	};

	constructor(id: string, location: CoordinateI, parameters: SettlementParametersI) {
		super(id, location);
		this.parameters = {
			...parameters,
			name: getRandomSettlementName([this.id])
		};
	}

	public get label(): string {
		return this.parameters.name;
	}

	public get title() {
		return `Town of ${Math.round(this.parameters.areaSize * 1000)} souls.`;
	}

	protected createGeometries() {
		const { areaSize, minimumBuildingLength, scale } = this.parameters;
		const seed = [this.id];
		const center = new Coordinate(areaSize / 2, areaSize / 2, 0);
		const root = RectangleParty.init(seed, areaSize, areaSize, {
			minimumBuildingLength: minimumBuildingLength
		});

		return (
			root
				.emit()
				.map(rect => ({
					rect,
					center: new Coordinate(rect.x + rect.w / 2, rect.y + rect.h / 2, 0)
				}))
				.map(obj => ({
					...obj,
					dist: center.euclideanDistanceTo(obj.center)
				}))
				.sort((a, b) => a.dist - b.dist)
				// .slice(0, 10)
				.map(({ rect, center }, i) => {
					let size = (rect.w + rect.h) / 2;

					// Wether this building faces north/south or east/west
					const orientation = Random.boolean([...seed, 'orientation']);
					// Shrink or grow this thing in different places
					const lengthScale = Random.between(0.3, 0.8, ...seed, 'length', 1);
					const widthScale = Random.between(0.3, 0.8, ...seed, 'width', 1);
					const baseHeight = Random.between(0.3 * size, 0.8 * size, ...seed, 'size', i);
					const roofHeight = Random.between(
						0.1 * baseHeight,
						0.4 * baseHeight,
						...seed,
						'roof',
						i
					);
					const geo = BuildingEntity.createGeometry({
						baseWidth: (orientation ? rect.w : rect.h) * lengthScale,
						baseDepth: (orientation ? rect.h : rect.w) * widthScale,
						baseHeight,
						roofHeight
					});
					if (orientation) {
						geo.rotateY(Math.PI / 2);
					}

					// Build it more sloppily, rotate a little bit more
					// geo.rotateY(Random.between(-0.4, 0.4, ...seed, 'rotate', i));
					geo.rotateY(Random.between(-Math.PI, Math.PI, ...seed, 'rotate', i));

					const c = convertCoordinate(center);
					const jostle = {
						x: Random.between(areaSize / 1.8, areaSize / 2.2, ...seed, 'jx', i),
						y: Random.between(areaSize / 1.8, areaSize / 2.2, ...seed, 'jy', i)
					};
					geo.translate(c.x - jostle.x, c.y, c.z - jostle.y);
					geo.scale(scale, scale, scale);
					return geo;
				})
		);
	}
}
