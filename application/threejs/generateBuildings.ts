import { Coordinate, Random, SeedI } from '@lib';
import { RectangleParty } from './generateRectangles.ts';

type BuildingI = {
	baseWidth: number;
	baseDepth: number;
	baseHeight: number;
	roofHeight: number;
	rotateY: number;
	translate: {
		x: number;
		y: number;
		z: number;
	};
	scale: number;
};

export function generateBuildings(
	seed: SeedI[],
	areaSize: number,
	minimumBuildingLength: number,
	scale: number,
): BuildingI[] {
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
			const size = (rect.w + rect.h) / 2;

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
