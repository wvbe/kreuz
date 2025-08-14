import { SimpleCoordinate } from './types';

/**
 * Creates fence coordinates around contiguous groups (islands) of tiles.
 *
 * For each contiguous group of tiles, this function generates a perimeter fence
 * by finding the outer edges and creating vertex coordinates that form a boundary
 * around the group. The fence coordinates are positioned at the vertices of the
 * tiles (typically at x±0.5, y±0.5 offsets from tile centers).
 *
 * @param tiles - Array of SimpleCoordinate representing tile center positions
 * @returns Array of SimpleCoordinate representing fence vertex positions around each island
 *
 * @example
 * ```typescript
 * // For a 2x2 square of tiles at [0,0], [0,1], [1,0], [1,1]
 * const tiles: SimpleCoordinate[] = [
 *   [0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0]
 * ];
 *
 * const fence = getFenceCoordinatesForTiles(tiles);
 * // Returns fence coordinates forming a rectangle around the 2x2 area
 * ```
 */
export function getFenceCoordinatesForTiles(tiles: SimpleCoordinate[]): SimpleCoordinate[] {
	if (tiles.length === 0) {
		return [];
	}

	// Group tiles into contiguous islands
	const islands = groupContiguousTiles(tiles);

	// Generate fence coordinates for each island
	const allFenceCoordinates: SimpleCoordinate[] = [];

	for (const island of islands) {
		const islandFence = generateFenceForIsland(island);
		allFenceCoordinates.push(...islandFence);
	}

	return allFenceCoordinates;
}

/**
 * Groups tiles into contiguous islands using flood-fill algorithm.
 */
function groupContiguousTiles(tiles: SimpleCoordinate[]): SimpleCoordinate[][] {
	const islands: SimpleCoordinate[][] = [];
	const unprocessed = [...tiles];

	while (unprocessed.length > 0) {
		const start = unprocessed.shift()!;
		const island = findContiguousGroup(start, unprocessed);

		// Remove processed tiles from unprocessed list
		for (const tile of island) {
			const index = unprocessed.findIndex(
				(t) => t[0] === tile[0] && t[1] === tile[1] && t[2] === tile[2],
			);
			if (index >= 0) {
				unprocessed.splice(index, 1);
			}
		}

		islands.push([start, ...island]);
	}

	return islands;
}

/**
 * Finds all tiles contiguous to the start tile using breadth-first search.
 */
function findContiguousGroup(
	start: SimpleCoordinate,
	availableTiles: SimpleCoordinate[],
): SimpleCoordinate[] {
	const group: SimpleCoordinate[] = [];
	const queue: SimpleCoordinate[] = [start];
	const visited = new Set<string>();

	while (queue.length > 0) {
		const current = queue.shift()!;
		const key = `${current[0]},${current[1]},${current[2]}`;

		if (visited.has(key)) {
			continue;
		}

		visited.add(key);

		// Find neighbors (adjacent tiles)
		const neighbors = getAdjacentTileCoordinates(current);

		for (const neighbor of neighbors) {
			const neighborKey = `${neighbor[0]},${neighbor[1]},${neighbor[2]}`;

			if (!visited.has(neighborKey)) {
				// Check if this neighbor exists in available tiles
				const found = availableTiles.find(
					(t) => t[0] === neighbor[0] && t[1] === neighbor[1] && t[2] === neighbor[2],
				);

				if (found) {
					group.push(found);
					queue.push(found);
				}
			}
		}
	}

	return group;
}

/**
 * Gets the 4 adjacent tile coordinates (north, south, east, west).
 */
function getAdjacentTileCoordinates(tile: SimpleCoordinate): SimpleCoordinate[] {
	const [x, y, z] = tile;
	return [
		[x - 1, y, z], // West
		[x + 1, y, z], // East
		[x, y - 1, z], // South
		[x, y + 1, z], // North
	];
}

/**
 * Generates fence coordinates around the perimeter of an island of tiles.
 *
 * This function works by:
 * 1. Finding all the exterior edges of the island
 * 2. Converting those edges to vertex coordinates
 * 3. Tracing the perimeter to form a coherent boundary
 */
function generateFenceForIsland(island: SimpleCoordinate[]): SimpleCoordinate[] {
	// Create a set for fast tile lookup
	const tileSet = new Set(island.map((t) => `${t[0]},${t[1]},${t[2]}`));

	// Find all exterior edges
	const edges: Edge[] = [];

	for (const tile of island) {
		const [x, y, z] = tile;

		// Check each of the 4 sides of the tile
		const sides = [
			{ from: [x - 0.5, y - 0.5, z], to: [x + 0.5, y - 0.5, z], neighbor: [x, y - 1, z] }, // Bottom
			{ from: [x + 0.5, y - 0.5, z], to: [x + 0.5, y + 0.5, z], neighbor: [x + 1, y, z] }, // Right
			{ from: [x + 0.5, y + 0.5, z], to: [x - 0.5, y + 0.5, z], neighbor: [x, y + 1, z] }, // Top
			{ from: [x - 0.5, y + 0.5, z], to: [x - 0.5, y - 0.5, z], neighbor: [x - 1, y, z] }, // Left
		];

		for (const side of sides) {
			const neighborKey = `${side.neighbor[0]},${side.neighbor[1]},${side.neighbor[2]}`;

			// If the neighbor is not in our island, this is an exterior edge
			if (!tileSet.has(neighborKey)) {
				edges.push({
					from: side.from as SimpleCoordinate,
					to: side.to as SimpleCoordinate,
				});
			}
		}
	}

	// Convert edges to ordered fence coordinates using proper boundary tracing
	return tracePerimeter(edges);
}

type Edge = {
	from: SimpleCoordinate;
	to: SimpleCoordinate;
};

/**
 * Traces the perimeter of the fence by following connected edges.
 * Returns unique vertices that form the boundary.
 */
function tracePerimeter(edges: Edge[]): SimpleCoordinate[] {
	if (edges.length === 0) {
		return [];
	}

	const vertices: SimpleCoordinate[] = [];
	const unusedEdges = [...edges];

	while (unusedEdges.length > 0) {
		// Start a new perimeter (handles multiple disconnected islands)
		const startEdge = unusedEdges.shift()!;
		const perimeter = [startEdge.from];
		let currentVertex = startEdge.to;

		// Trace the perimeter until we return to start or can't find next edge
		while (true) {
			perimeter.push(currentVertex);

			// Find the next edge that starts from current vertex
			const nextEdgeIndex = unusedEdges.findIndex((edge) =>
				coordinatesEqual(edge.from, currentVertex),
			);

			if (nextEdgeIndex >= 0) {
				const nextEdge = unusedEdges.splice(nextEdgeIndex, 1)[0];
				currentVertex = nextEdge.to;

				// Check if we've completed the loop
				if (coordinatesEqual(currentVertex, perimeter[0])) {
					break;
				}
			} else {
				// Try reverse direction
				const reverseEdgeIndex = unusedEdges.findIndex((edge) =>
					coordinatesEqual(edge.to, currentVertex),
				);
				if (reverseEdgeIndex < 0) {
					// Can't find connected edge, end this perimeter
					break;
				}
				const reverseEdge = unusedEdges.splice(reverseEdgeIndex, 1)[0];
				currentVertex = reverseEdge.from;

				// Check if we've completed the loop
				if (coordinatesEqual(currentVertex, perimeter[0])) {
					break;
				}
			}
		}

		// Add this perimeter to vertices (exclude the duplicate closing vertex)
		if (perimeter.length > 2 && coordinatesEqual(currentVertex, perimeter[0])) {
			vertices.push(...perimeter);
		} else {
			// @NOTE either the "if" or the "else" is wrong in this one
			vertices.push(...perimeter);
		}
	}

	// Remove duplicate vertices and simplify by removing collinear vertices
	const unique = removeDuplicateVertices(vertices);
	return simplifyPerimeter(unique);
}

/**
 * Removes duplicate vertices while preserving order.
 */
function removeDuplicateVertices(vertices: SimpleCoordinate[]): SimpleCoordinate[] {
	const unique: SimpleCoordinate[] = [];
	const seen = new Set<string>();

	for (const vertex of vertices) {
		const key = `${vertex[0]},${vertex[1]},${vertex[2]}`;
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(vertex);
		}
	}

	return unique;
}

/**
 * Simplifies a perimeter by removing collinear vertices.
 * This converts a detailed edge trace into a minimal set of corner vertices.
 */
function simplifyPerimeter(vertices: SimpleCoordinate[]): SimpleCoordinate[] {
	if (vertices.length <= 3) {
		return vertices;
	}

	const simplified: SimpleCoordinate[] = [];

	for (let i = 0; i < vertices.length; i++) {
		const prev = vertices[(i - 1 + vertices.length) % vertices.length];
		const current = vertices[i];
		const next = vertices[(i + 1) % vertices.length];

		// Check if current vertex is collinear with prev and next
		if (!areCollinear(prev, current, next)) {
			simplified.push(current);
		}
	}

	return simplified;
}

/**
 * Checks if three points are collinear (on the same straight line).
 * Uses cross product to determine if points are collinear.
 */
function areCollinear(a: SimpleCoordinate, b: SimpleCoordinate, c: SimpleCoordinate): boolean {
	// Vector from a to b
	const ab = [b[0] - a[0], b[1] - a[1]];
	// Vector from b to c
	const bc = [c[0] - b[0], c[1] - b[1]];

	// Cross product in 2D (we ignore z for collinearity test)
	const crossProduct = ab[0] * bc[1] - ab[1] * bc[0];

	// Points are collinear if cross product is zero (within floating point tolerance)
	return Math.abs(crossProduct) < 1e-10;
}

/**
 * Helper function to check if two coordinates are equal.
 */
function coordinatesEqual(a: SimpleCoordinate, b: SimpleCoordinate): boolean {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
