import { expect } from '@jest/globals';
import { Terrain } from '../../../terrain/Terrain';
import { QualifiedCoordinate } from '../../../terrain/types';
import {
	COST_OF_SWITCHING_TERRAINS,
	getEuclideanMapDistanceAcrossSpaces,
} from './getEuclideanMapDistanceAcrossSpaces';
import { getEuclideanMapDistance } from './getEuclideanMapDistance';

// Note: does not test the distance multipliers for different spaces

describe('getEuclideanMapDistanceAcrossSpaces', () => {
	const terrainWorld = new Terrain({ id: 'world' });
	const terrainCity = new Terrain({
		id: 'city',
		parentage: {
			portalStart: [3, 0, 0],
			parentTerrain: terrainWorld,
			portalEnd: [0, 2, 0],
		},
	});
	const terrainHouse = new Terrain({
		id: 'house',
		parentage: {
			portalStart: [2, 0, 0],
			parentTerrain: terrainCity,
			portalEnd: [0, 5, 0],
		},
	});
	it('should calculate distance between two points in the same space', () => {
		const point1: QualifiedCoordinate = [terrainWorld, 0, 0, 0];
		const point2: QualifiedCoordinate = [terrainWorld, 3, 4, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(getEuclideanMapDistance([0, 0, 0], [3, 4, 0]));
	});
	it('should calculate distance between two points in the same space, if it has a parent', () => {
		const point1: QualifiedCoordinate = [terrainCity, 0, 0, 0];
		const point2: QualifiedCoordinate = [terrainCity, 3, 4, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(getEuclideanMapDistance([0, 0, 0], [3, 4, 0]));
	});
	it('should calculate distance between two points, going from parent into child', () => {
		const point1: QualifiedCoordinate = [terrainWorld, 0, 0, 0];
		const point2: QualifiedCoordinate = [terrainCity, 3, 4, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(
			getEuclideanMapDistance([0, 0, 0], [3, 0, 0]) +
				COST_OF_SWITCHING_TERRAINS +
				getEuclideanMapDistance([0, 2, 0], [3, 4, 0]),
		);
	});
	it('should calculate distance between two points, going from parent into descendant', () => {
		const point1: QualifiedCoordinate = [terrainWorld, 0, 0, 0];
		const point2: QualifiedCoordinate = [terrainHouse, 3, 4, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(
			getEuclideanMapDistance([0, 0, 0], [3, 0, 0]) +
				COST_OF_SWITCHING_TERRAINS +
				getEuclideanMapDistance([0, 2, 0], [2, 0, 0]) +
				COST_OF_SWITCHING_TERRAINS +
				getEuclideanMapDistance([0, 5, 0], [3, 4, 0]),
		);
	});
	it('should calculate distance between two points, going from child into parent', () => {
		const point1: QualifiedCoordinate = [terrainCity, 0, 0, 0];
		const point2: QualifiedCoordinate = [terrainWorld, 3, 4, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(
			getEuclideanMapDistance([0, 0, 0], [0, 2, 0]) +
				COST_OF_SWITCHING_TERRAINS +
				getEuclideanMapDistance([3, 0, 0], [3, 4, 0]),
		);
	});
	it('should calculate distance between two points, going from child into ancestor', () => {
		const point1: QualifiedCoordinate = [terrainHouse, 0, 0, 0];
		const point2: QualifiedCoordinate = [terrainWorld, 3, 4, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(
			getEuclideanMapDistance([0, 0, 0], [0, 5, 0]) +
				COST_OF_SWITCHING_TERRAINS +
				getEuclideanMapDistance([2, 0, 0], [0, 2, 0]) +
				COST_OF_SWITCHING_TERRAINS +
				getEuclideanMapDistance([3, 0, 0], [3, 4, 0]),
		);
	});
	it('should calculate distance between two sides of a portal', () => {
		const point1: QualifiedCoordinate = [terrainHouse, 0, 5, 0];
		const point2: QualifiedCoordinate = [terrainCity, 2, 0, 0];
		const distance = getEuclideanMapDistanceAcrossSpaces(point1, point2);
		expect(distance).toBe(COST_OF_SWITCHING_TERRAINS);
	});
});
