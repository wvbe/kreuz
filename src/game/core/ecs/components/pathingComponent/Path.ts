// An adaptation of:
//   javascript-astar 0.4.1
//   http://github.com/bgrins/javascript-astar
//   Freely distributable under the MIT License.
//   Implements the astar search algorithm in javascript using a Binary Heap.
//   Includes Binary Heap (with modifications) from Marijn Haverbeke.
//   http://eloquentjavascript.net/appendix2.html

import { QualifiedCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';
import { getEuclideanDistanceAcrossSpaces } from '../location/getEuclideanDistanceAcrossSpaces';
import { isMapLocationEqualTo } from '../location/isMapLocationEqualTo';
import { BinaryHeap } from './BinaryHeap';
import { getTerrainHopsBetweenCoordinates } from './getTerrainHopsBetweenCoordinates';

// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
type HeuristicScorer<PathableEntity> = (a: PathableEntity, b: PathableEntity) => number;

/**
 * Perform an A* Search on a graph given a start and end node.
 */

type HeuristicReport<PathableEntity> = {
	coordinate: PathableEntity;
	h: number;
	g: number;
	f: number;
	parent: HeuristicReport<PathableEntity> | null;
	closed: boolean;
	visited: boolean;
};

type PathOptions<PathableEntity> = {
	/**
	 * Set to true if you'll accept any path to as close as you can get, rather than strictly
	 * to the destination completely.
	 */
	closest: boolean;
	heuristic?: HeuristicScorer<PathableEntity>;
	obstacles?: { coordinate: QualifiedCoordinate; cost: number }[];
	getLocation: (entity: PathableEntity) => QualifiedCoordinate;
	getNeighbours: (entity: PathableEntity) => PathableEntity[];
	/**
	 * Should return a number between 0 and 1 representing how easy it is to walk on this entity;
	 * - 0 being completely impassable
	 * - 1 being completely walkable
	 *
	 * This number will affect the cost of departing from, as well as arriving to, this tile.
	 */
	getWalkability: (entity: PathableEntity) => number;
};
export class Path<PathableEntity> {
	readonly #options: PathOptions<PathableEntity>;
	readonly #cache: Map<PathableEntity, HeuristicReport<PathableEntity>>;
	readonly #heap: BinaryHeap<PathableEntity>;
	readonly #heuristic: HeuristicScorer<PathableEntity>;

	constructor(public readonly start: PathableEntity, options: PathOptions<PathableEntity>) {
		this.#options = options;
		this.#cache = new Map<PathableEntity, HeuristicReport<PathableEntity>>();
		this.#heap = new BinaryHeap<PathableEntity>((node) => {
			const heuristic = this.#cache.get(node);
			if (!heuristic) {
				throw new Error('This is weird');
			}
			return heuristic.f;
		});
		this.#heuristic = (pos0, pos1) => {
			return getEuclideanDistanceAcrossSpaces(
				this.#options.getLocation(pos0),
				this.#options.getLocation(pos1),
			); // + this.getVisitationCost(pos0, pos1)
		};
	}

	/**
	 * The cost of visiting a tile is the inverse of the walkability of the tile. Also includes a penalty
	 * for additional obstacles.
	 */
	private getVisitationCost(start: PathableEntity, destination: PathableEntity): number {
		const walkability =
			this.#options.getWalkability(start) * this.#options.getWalkability(destination);
		if (!this.#options.obstacles) {
			return 1 / walkability;
		}

		const cost = this.#options.obstacles
			.filter((obstacle) =>
				isMapLocationEqualTo(this.#options.getLocation(destination), obstacle.coordinate),
			)
			.reduce((total, obstacle) => total + obstacle.cost, 1);

		return cost / walkability;
	}

	/**
	 * Find a path to the given destination.
	 */
	public to(destination: PathableEntity) {
		let closestNode = this.start; // set the start node to be the closest if required
		let closestNodeHeuristics: HeuristicReport<PathableEntity> = {
			coordinate: closestNode,
			h: this.#heuristic(this.start, destination),
			g: 0,
			f: 0,

			parent: null,

			// Unsure what the default value should be
			closed: true,
			visited: true,
		};

		// At this stage `start` is also `closestNode`, so lets associate those heuristics
		this.#cache.set(this.start, closestNodeHeuristics);

		this.#heap.push(this.start);

		while (this.#heap.size() > 0) {
			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			const currentNode = this.#heap.pop();
			const currentNodeHeuristics = this.#cache.get(currentNode);
			if (!currentNodeHeuristics) {
				throw new Error('Somehow opening a node that has no heuristic data');
			}

			// End case -- result has been found, return the traced path.
			if (
				isMapLocationEqualTo(
					this.#options.getLocation(currentNode),
					this.#options.getLocation(destination),
				)
			) {
				return this.tracePath(currentNodeHeuristics);
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbors.
			currentNodeHeuristics.closed = true;

			// Find all neighbors for the current node.
			const neighbors = this.#options.getNeighbours(currentNode);

			for (let i = 0, il = neighbors.length; i < il; ++i) {
				const neighbor = neighbors[i];
				let neighborHeuristics = this.#cache.get(neighbor);

				if (neighborHeuristics?.closed || this.#options.getWalkability(neighbor) <= 0) {
					// Not a valid node to process, skip to next neighbor.
					continue;
				}

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
				const gScore =
					currentNodeHeuristics.g + this.getVisitationCost(currentNode, neighbor);
				const beenVisited = !!neighborHeuristics;

				if (!beenVisited || (neighborHeuristics && gScore < neighborHeuristics.g)) {
					const hScore = this.#heuristic(neighbor, destination);
					// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
					neighborHeuristics = {
						coordinate: neighbor,
						h: hScore,
						g: gScore,
						f: gScore + hScore,
						parent: currentNodeHeuristics,
						closed: true,
						visited: true,
					};
					this.#cache.set(
						neighbor,
						neighborHeuristics as HeuristicReport<PathableEntity>,
					);

					if (this.#options.closest) {
						// If the neighbour is closer than the current closestNode or if it's equally close but has
						// a cheaper path than the current closest node then it becomes the closest node
						if (
							neighborHeuristics.h < closestNodeHeuristics.h ||
							(neighborHeuristics.h === closestNodeHeuristics.h &&
								neighborHeuristics.g < closestNodeHeuristics.g)
						) {
							closestNode = neighbor;
							closestNodeHeuristics = neighborHeuristics;
						}
					}

					if (!beenVisited) {
						// Pushing to heap will put it in proper place based on the 'f' value.
						this.#heap.push(neighbor);
					} else {
						// Already seen the node, but since it has been rescored we need to reorder it in the heap
						this.#heap.rescoreElement(neighbor);
					}
				}
			}
		}

		if (this.#options.closest) {
			return this.tracePath(closestNodeHeuristics);
		}

		// No result was found - empty array signifies failure to find path.
		// @TODO this is a costly non-answer? investigate when you see this log message maybe:
		return [];
	}

	/**
	 * Out of a few different destinations, pick the one that is the easiest to get to, and return
	 * the path to it.
	 *
	 * @NOTE
	 * - Currently picks the destination _closest to the start_ but not necessarily with the shortest
	 *   path to it.
	 * - As an optimization, may weed out the tiles that are on a different island early.
	 */
	public toClosestOf(destinations: PathableEntity[]) {
		const nearest: {
			tile: PathableEntity;
			distance: number;
			path?: PathableEntity[];
		}[] = destinations
			.map((tile) => ({
				tile,
				distance: getEuclideanDistanceAcrossSpaces(
					this.#options.getLocation(this.start),
					this.#options.getLocation(tile),
				),
			}))
			.sort((a, b) => a.distance - b.distance);

		// @TODO possibly filter churches that are on the same island? Could make the pathing function a little
		// less expensive.

		const shortest = nearest.reduce((last, option) => {
			if (last.path) {
				return last;
			}
			const path = this.to(option.tile);
			if (!path.length) {
				return last;
			}
			return {
				...option,
				path,
			};
		}, nearest[0]);
		if (!shortest.path) {
			return null;
		}
		return {
			tile: shortest.tile,
			path: shortest.path,
		};
	}

	private tracePath(heuristicReport: HeuristicReport<PathableEntity>) {
		let curr = heuristicReport;
		const path = [];
		while (curr.parent) {
			path.unshift(curr);
			curr = curr.parent;
		}
		return path.map((heuristicReport) => heuristicReport.coordinate);
	}

	/**
	 * Create an instance of {@link Path} preconfigured to navigate between {@link Tile}.
	 */
	public static between(
		startTile: Tile,
		destinationTile: Tile,
		options: Omit<PathOptions<Tile>, 'getLocation' | 'getNeighbours' | 'getWalkability'>,
	): Tile[] {
		if (isMapLocationEqualTo(startTile.location.get(), destinationTile.location.get())) {
			return [startTile];
		}

		const pathingOptions: PathOptions<Tile> = {
			...options,
			getNeighbours: (tile) => tile.pathingNeighbours as Tile[],
			getLocation: (tile) => tile.location.get(),
			getWalkability: (tile) => tile.walkability,
		};
		const terrainsInBetween = getTerrainHopsBetweenCoordinates(
			startTile.location.get(),
			destinationTile.location.get(),
		).slice(1);

		const tiles: Tile[] = [];

		let [currentTerrain, ...currentLocation] = startTile.location.get();

		for (const nextTerrain of terrainsInBetween) {
			const currentTile = currentTerrain.getTileAtMapLocation(currentLocation);
			const nextPortalLocation = currentTerrain.getLocationOfPortalToTerrain(nextTerrain);
			const nextPortalTile = currentTerrain.getTileAtMapLocation(nextPortalLocation);
			if (currentTile !== nextPortalTile) {
				const pathToPortal = new Path<Tile>(currentTile, pathingOptions).to(nextPortalTile);
				if (!pathToPortal.length) {
					return [];
				}
				tiles.push(...pathToPortal);
			}

			currentLocation = nextTerrain.getLocationOfPortalToTerrain(currentTerrain);
			currentTerrain = nextTerrain;
			tiles.push(currentTerrain.getTileAtMapLocation(currentLocation));
		}

		const currentTile = currentTerrain.getTileAtMapLocation(currentLocation);
		if (currentTile !== destinationTile) {
			const nextPath = new Path<Tile>(currentTile, pathingOptions).to(destinationTile);
			if (!nextPath.length) {
				return [];
			}
			tiles.push(...nextPath);
		}

		return tiles;
	}

	/**
	 * @deprecated together with {@link getIslandHopsBetweenCoordinates}
	 */
	public static forTerrainIslands<X extends { tiles: Tile[]; neighbours: X[] }>(
		start: X,
		options: Omit<PathOptions<X>, 'getLocation' | 'getNeighbours' | 'getWalkability'>,
	) {
		return new Path(start, {
			...options,
			getNeighbours: (island) => island.neighbours,
			// @TODO: calculate island location based on terrain location and the mean x/y coordinate of tiles
			getLocation: (island) => [island.tiles[0].location.get()[0], 0, 0, 0],
			getWalkability: () => 1,
		});
	}
}
