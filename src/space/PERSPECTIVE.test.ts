import { distanceToCameraComparator } from './PERSPECTIVE';

test('sortCoordinatesByCameraDistance', () => {
	const sortedCoords = [
		{ x: 0, y: 0, z: 0 },
		{ x: 1, y: 0, z: 0 },
		{ x: 2, y: 0, z: 0 },
		{ x: 0, y: 1, z: 0 },
		{ x: 1, y: 1, z: 0 },
		{ x: 2, y: 1, z: 0 },
		{ x: 0, y: 2, z: 0 },
		{ x: 1, y: 2, z: 0 },
		{ x: 2, y: 2, z: 0 },
		{ x: 0, y: 0, z: 1 },
		{ x: 0, y: 0, z: 2 }
	].sort(distanceToCameraComparator);
	expect(sortedCoords[0]).toEqual({ x: 0, y: 2, z: 0 });
});
