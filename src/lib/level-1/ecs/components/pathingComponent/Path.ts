// An adaptation of:
//   javascript-astar 0.4.1
//   http://github.com/bgrins/javascript-astar
//   Freely distributable under the MIT License.
//   Implements the astar search algorithm in javascript using a Binary Heap.
//   Includes Binary Heap (with modifications) from Marijn Haverbeke.
//   http://eloquentjavascript.net/appendix2.html

import { SimpleCoordinate } from '../../../terrain/types';
import { EcsEntity } from '../../types';
import { locationComponent } from '../locationComponent';
import { pathableComponent } from '../pathableComponent';
import { BinaryHeap } from './BinaryHeap';

type PathableEntity = EcsEntity<typeof pathableComponent | typeof locationComponent>;

function isPathableEntity(entity: EcsEntity): entity is PathableEntity {
	return pathableComponent.test(entity) && locationComponent.test(entity);
}

// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
type HeuristicScorer = (a: PathableEntity, b: PathableEntity) => number;

/**
 * Perform an A* Search on a graph given a start and end node.
 */

type HeuristicReport = {
	coordinate: PathableEntity;
	h: number;
	g: number;
	f: number;
	parent: HeuristicReport | null;
	closed: boolean;
	visited: boolean;
};

type PathOptions = {
	closest: boolean;
	heuristic?: HeuristicScorer;
	obstacles?: { coordinate: SimpleCoordinate; cost: number }[];
};

export class Path {
	readonly #options: PathOptions;
	readonly #cache: Map<PathableEntity, HeuristicReport>;
	readonly #heap: BinaryHeap<PathableEntity>;
	readonly #heuristic: HeuristicScorer;

	constructor(options: PathOptions) {
		this.#options = options;
		this.#cache = new Map<PathableEntity, HeuristicReport>();
		this.#heap = new BinaryHeap<PathableEntity>((node) => {
			const heuristic = this.#cache.get(node);
			if (!heuristic) {
				throw new Error('This is weird');
			}
			return heuristic.f;
		});
		this.#heuristic = (pos0, pos1) => {
			return pos0.euclideanDistanceTo(pos1.location.get()); // + this.getVisitationCost(pos0, pos1)
		};
	}

	private getVisitationCost(from: PathableEntity, to: PathableEntity): number {
		if (!this.#options.obstacles) {
			return 1;
		}
		const cost = this.#options.obstacles
			.filter((obstacle) => to.equalsMapLocation(obstacle.coordinate))
			.reduce((total, obstacle) => total + obstacle.cost, 1);

		return cost;
	}

	public findPathBetween(start: PathableEntity, end: PathableEntity) {
		let closestNode = start; // set the start node to be the closest if required
		let closestNodeHeuristics: HeuristicReport = {
			coordinate: closestNode,
			h: this.#heuristic(start, end),
			g: 0,
			f: 0,

			parent: null,

			// Unsure what the default value should be
			closed: true,
			visited: true,
		};

		// At this stage `start` is also `closestNode`, so lets associate those heuristics
		this.#cache.set(start, closestNodeHeuristics);

		this.#heap.push(start);

		while (this.#heap.size() > 0) {
			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			const currentNode = this.#heap.pop();
			const currentNodeHeuristics = this.#cache.get(currentNode);
			if (!currentNodeHeuristics) {
				throw new Error('Somehow opening a node that has no heuristic data');
			}

			// End case -- result has been found, return the traced path.
			if (currentNode.equalsMapLocation(end.location.get())) {
				return this.tracePath(currentNodeHeuristics);
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbors.
			currentNodeHeuristics.closed = true;

			// Find all neighbors for the current node.
			const neighbors = currentNode.pathingNeighbours.filter(isPathableEntity);

			for (let i = 0, il = neighbors.length; i < il; ++i) {
				const neighbor = neighbors[i];
				let neighborHeuristics = this.#cache.get(neighbor);

				if (neighborHeuristics?.closed || neighbor.walkability <= 0) {
					// Not a valid node to process, skip to next neighbor.
					continue;
				}

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
				const gScore =
					currentNodeHeuristics.g + this.getVisitationCost(currentNode, neighbor);
				const beenVisited = !!neighborHeuristics;

				if (!beenVisited || (neighborHeuristics && gScore < neighborHeuristics.g)) {
					const hScore = this.#heuristic(neighbor, end);
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
					this.#cache.set(neighbor, neighborHeuristics as HeuristicReport);

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
	public findPathToClosest(start: PathableEntity, options: PathableEntity[]) {
		const nearest: {
			tile: PathableEntity;
			distance: number;
			path?: PathableEntity[];
		}[] = options
			.map((tile) => ({
				tile,
				distance: start.euclideanDistanceTo(tile.location.get()),
			}))
			.sort((a, b) => a.distance - b.distance);

		// @TODO possibly filter churches that are on the same island? Could make the pathing function a little
		// less expensive.

		const shortest = nearest.reduce((last, option) => {
			if (last.path) {
				return last;
			}
			const path = this.findPathBetween(start, option.tile);
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

	private tracePath(heuristicReport: HeuristicReport) {
		let curr = heuristicReport;
		const path = [];
		while (curr.parent) {
			path.unshift(curr);
			curr = curr.parent;
		}
		return path.map((heuristicReport) => heuristicReport.coordinate);
	}
}
