import { Coordinate } from '../classes/Coordinate';
import { distanceToCameraComparator } from './perspective';

test('sortCoordinatesByCameraDistance', () => {
	const sortedCoords = [
		new Coordinate(0, 0, 0),
		new Coordinate(1, 0, 0),
		new Coordinate(2, 0, 0),
		new Coordinate(0, 1, 0),
		new Coordinate(1, 1, 0),
		new Coordinate(2, 1, 0),
		new Coordinate(0, 2, 0),
		new Coordinate(1, 2, 0),
		new Coordinate(2, 2, 0),
		new Coordinate(0, 0, 1),
		new Coordinate(0, 0, 2)
	].sort(distanceToCameraComparator);
	expect(sortedCoords[0]).toEqual({ x: 0, y: 2, z: 0 });
});
