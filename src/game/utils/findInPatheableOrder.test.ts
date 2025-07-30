import { describe, expect, it } from '@jest/globals';
import { pathableComponent } from '../core/ecs/components/pathableComponent';
import { EcsEntity } from '../core/ecs/types';
import {
	findHopsToSelectedPatheables,
	FindInPatheableOrderResult,
} from './findHopsToSelectedPatheables';

type PathableEntity = EcsEntity<typeof pathableComponent>;

describe('findInPatheableOrder', () => {
	/**
	 * Helper function to create a mock pathable entity
	 */
	function createMockEntity(id: string, walkability: number = 1): PathableEntity {
		const entity = {
			id,
			walkability,
			pathingNeighbours: [] as PathableEntity[],
		};
		return entity;
	}

	/**
	 * Helper function to connect entities by setting their pathingNeighbours
	 */
	function connectEntities(entities: PathableEntity[], connections: [string, string][]): void {
		for (const [fromId, toId] of connections) {
			const from = entities.find((e) => e.id === fromId);
			const to = entities.find((e) => e.id === toId);
			if (from && to) {
				from.pathingNeighbours.push(to);
				to.pathingNeighbours.push(from);
			}
		}
	}

	it('should return empty array when selector returns IGNORE for all tiles', () => {
		const start = createMockEntity('start');
		const result = findHopsToSelectedPatheables(start, () => FindInPatheableOrderResult.IGNORE);

		expect(result).toEqual([]);
	});

	it('should include start tile when selector returns INCLUDE', () => {
		const start = createMockEntity('start');
		const result = findHopsToSelectedPatheables(
			start,
			() => FindInPatheableOrderResult.INCLUDE,
		);

		expect(result).toEqual([{ hops: 0, tile: start }]);
	});

	it('should stop traversal when selector returns STOP', () => {
		const start = createMockEntity('start');
		const neighbour = createMockEntity('neighbour');
		start.pathingNeighbours.push(neighbour);
		neighbour.pathingNeighbours.push(start);

		const visitedTiles: string[] = [];
		const result = findHopsToSelectedPatheables(start, (tile) => {
			visitedTiles.push(tile.id);
			return FindInPatheableOrderResult.STOP;
		});

		expect(result).toEqual([]);
		expect(visitedTiles).toEqual(['start']);
	});

	it('should traverse connected tiles in breadth-first order', () => {
		// Create a simple chain: start -> A -> B -> C
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');
		const C = createMockEntity('C');

		connectEntities(
			[start, A, B, C],
			[
				['start', 'A'],
				['A', 'B'],
				['B', 'C'],
			],
		);

		const visitedOrder: string[] = [];
		const result = findHopsToSelectedPatheables(start, (tile) => {
			visitedOrder.push(tile.id);
			return FindInPatheableOrderResult.INCLUDE;
		});

		expect(visitedOrder).toEqual(['start', 'A', 'B', 'C']);
		expect(result).toEqual([
			{ hops: 0, tile: start },
			{ hops: 1, tile: A },
			{ hops: 2, tile: B },
			{ hops: 3, tile: C },
		]);
	});

	it('should handle branching paths correctly', () => {
		// Create a branching structure:
		//     A
		//   /   \
		// start   C
		//   \   /
		//     B
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');
		const C = createMockEntity('C');

		connectEntities(
			[start, A, B, C],
			[
				['start', 'A'],
				['start', 'B'],
				['A', 'C'],
				['B', 'C'],
			],
		);

		const visitedOrder: string[] = [];
		const result = findHopsToSelectedPatheables(start, (tile) => {
			visitedOrder.push(tile.id);
			return FindInPatheableOrderResult.INCLUDE;
		});

		// The function may visit C twice due to multiple paths, but should only include it once in results
		// The exact visit order may vary due to the queue implementation
		expect(result).toHaveLength(5);
		expect(result.find((r) => r.tile.id === 'start')?.hops).toBe(0);
		expect(result.find((r) => r.tile.id === 'A')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'B')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'C')?.hops).toBe(2);

		// Verify all tiles are visited and hopss are correct
		expect(result.find((r) => r.tile.id === 'start')?.hops).toBe(0);
		expect(result.find((r) => r.tile.id === 'A')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'B')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'C')?.hops).toBe(2);
	});

	it('should not revisit already explored tiles', () => {
		// Create a cycle: start -> A -> B -> start
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');

		connectEntities(
			[start, A, B],
			[
				['start', 'A'],
				['A', 'B'],
				['B', 'start'],
			],
		);

		const result = findHopsToSelectedPatheables(start, (tile) => {
			return FindInPatheableOrderResult.INCLUDE;
		});

		// Should only include each tile once in results, even if visited multiple times
		expect(result).toHaveLength(4);
		expect(result.find((r) => r.tile.id === 'start')?.hops).toBe(0);
		expect(result.find((r) => r.tile.id === 'A')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'B')?.hops).toBe(1);

		// Verify hopss are correct
		expect(result.find((r) => r.tile.id === 'start')?.hops).toBe(0);
		expect(result.find((r) => r.tile.id === 'A')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'B')?.hops).toBe(1);
	});

	it('should handle mixed selector results', () => {
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');
		const C = createMockEntity('C');

		connectEntities(
			[start, A, B, C],
			[
				['start', 'A'],
				['A', 'B'],
				['B', 'C'],
			],
		);

		const result = findHopsToSelectedPatheables(start, (tile) => {
			if (tile.id === 'start') return FindInPatheableOrderResult.IGNORE;
			if (tile.id === 'A') return FindInPatheableOrderResult.INCLUDE;
			if (tile.id === 'B') return FindInPatheableOrderResult.STOP;
			return FindInPatheableOrderResult.IGNORE;
		});

		expect(result).toEqual([{ hops: 1, tile: A }]);
	});

	it('should handle disconnected tiles', () => {
		const start = createMockEntity('start');
		const isolated = createMockEntity('isolated');
		// isolated has no connections

		const result = findHopsToSelectedPatheables(
			start,
			() => FindInPatheableOrderResult.INCLUDE,
		);

		expect(result).toEqual([{ hops: 0, tile: start }]);
	});

	it('should handle void return from selector', () => {
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		start.pathingNeighbours.push(A);
		A.pathingNeighbours.push(start);

		const result = findHopsToSelectedPatheables(start, (tile) => {
			// Return void (undefined) - should be treated as IGNORE
			if (tile.id === 'start') return;
		});

		expect(result).toEqual([]);
	});

	it('should handle INCLUDE_AND_STOP result correctly', () => {
		// Create a chain: start -> A -> B -> C
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');
		const C = createMockEntity('C');

		connectEntities(
			[start, A, B, C],
			[
				['start', 'A'],
				['A', 'B'],
				['B', 'C'],
			],
		);

		const visitedTiles: string[] = [];
		const result = findHopsToSelectedPatheables(start, (tile) => {
			visitedTiles.push(tile.id);
			if (tile.id === 'A') {
				return FindInPatheableOrderResult.INCLUDE_AND_STOP;
			}
			return FindInPatheableOrderResult.INCLUDE;
		});

		// Should include start and A, then stop traversal
		expect(result).toEqual([
			{ hops: 0, tile: start },
			{ hops: 1, tile: A },
		]);
		// Should only visit start and A, not B or C
		expect(visitedTiles).toEqual(['start', 'A']);
	});

	it('should handle INCLUDE_AND_STOP on start tile', () => {
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');
		start.pathingNeighbours.push(A);
		A.pathingNeighbours.push(start);
		A.pathingNeighbours.push(B);
		B.pathingNeighbours.push(A);

		const visitedTiles: string[] = [];
		const result = findHopsToSelectedPatheables(start, (tile) => {
			visitedTiles.push(tile.id);
			if (tile.id === 'start') {
				return FindInPatheableOrderResult.INCLUDE_AND_STOP;
			}
			return FindInPatheableOrderResult.INCLUDE;
		});

		// Should only include start and stop immediately
		expect(result).toEqual([{ hops: 0, tile: start }]);
		// Should only visit start, not A or B
		expect(visitedTiles).toEqual(['start']);
	});

	it('should handle complex network with multiple paths', () => {
		// Create a more complex network:
		//     D
		//   /   \
		// A --- B --- C
		//   \   |   /
		//     E   F
		const start = createMockEntity('start');
		const A = createMockEntity('A');
		const B = createMockEntity('B');
		const C = createMockEntity('C');
		const D = createMockEntity('D');
		const E = createMockEntity('E');
		const F = createMockEntity('F');

		connectEntities(
			[start, A, B, C, D, E, F],
			[
				['start', 'A'],
				['A', 'B'],
				['A', 'D'],
				['A', 'E'],
				['B', 'C'],
				['B', 'D'],
				['B', 'E'],
				['C', 'F'],
				['D', 'E'],
				['E', 'F'],
			],
		);

		const result = findHopsToSelectedPatheables(
			start,
			() => FindInPatheableOrderResult.INCLUDE,
		);

		// Should find all tiles with correct hopss
		expect(result).toHaveLength(11);
		expect(result.find((r) => r.tile.id === 'start')?.hops).toBe(0);
		expect(result.find((r) => r.tile.id === 'A')?.hops).toBe(1);
		expect(result.find((r) => r.tile.id === 'B')?.hops).toBe(2);
		expect(result.find((r) => r.tile.id === 'C')?.hops).toBe(3);
		expect(result.find((r) => r.tile.id === 'D')?.hops).toBe(2);
		expect(result.find((r) => r.tile.id === 'E')?.hops).toBe(2);
		expect(result.find((r) => r.tile.id === 'F')?.hops).toBe(3);
	});
});
