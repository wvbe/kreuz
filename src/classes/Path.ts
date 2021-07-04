// An adaptation of:
//   javascript-astar 0.4.1
//   http://github.com/bgrins/javascript-astar
//   Freely distributable under the MIT License.
//   Implements the astar search algorithm in javascript using a Binary Heap.
//   Includes Binary Heap (with modifications) from Marijn Haverbeke.
//   http://eloquentjavascript.net/appendix2.html

import { BinaryHeap } from '../util/BinaryHeap';
import { GenericTerrain, GenericTile } from '../terrain/GenericTerrain';

// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
type HeuristicScorer = (a: GenericTile, b: GenericTile) => number;

/**
 * Perform an A* Search on a graph given a start and end node.
 */

type HeuristicReport = {
	coordinate: GenericTile;
	h: number;
	g: number;
	f: number;
	parent: HeuristicReport | null;
	closed: Boolean;
	visited: boolean;
};

type PathOptions = {
	closest: Boolean;
	heuristic?: HeuristicScorer;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MANHATTAN: HeuristicScorer = (pos0, pos1) => {
	const d1 = Math.abs(pos1.x - pos0.x);
	const d2 = Math.abs(pos1.y - pos0.y);
	return d1 + d2;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DIAGONAL: HeuristicScorer = (pos0, pos1) => {
	const D = 1;
	const D2 = Math.sqrt(2);
	const d1 = Math.abs(pos1.x - pos0.x);
	const d2 = Math.abs(pos1.y - pos0.y);
	return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
};

function getVisitationCost(
	terrain: GenericTerrain<GenericTile>,
	from: GenericTile,
	neighbor: GenericTile
) {
	return 1;
}

export class Path {
	private readonly terrain: GenericTerrain<GenericTile>;
	private readonly options: PathOptions;
	private readonly cache: Map<GenericTile, HeuristicReport>;
	private readonly heap: BinaryHeap<GenericTile>;
	private readonly heuristic: HeuristicScorer;

	constructor(graph: GenericTerrain<GenericTile>, options: PathOptions) {
		this.terrain = graph;
		this.options = options;

		this.cache = new Map<GenericTile, HeuristicReport>();

		this.heap = new BinaryHeap<GenericTile>(node => {
			const heuristic = this.cache.get(node);
			if (!heuristic) {
				throw new Error('This is weird');
			}
			return heuristic.f;
		});

		this.heuristic = DIAGONAL;
	}

	find(start: GenericTile, end: GenericTile) {
		let closestNode = start; // set the start node to be the closest if required
		let closestNodeHeuristics: HeuristicReport = {
			coordinate: closestNode,
			h: this.heuristic(start, end),
			g: 0,
			f: 0,

			parent: null,

			// Unsure what the default value should be
			closed: true,
			visited: true
		};

		// At this stage `start` is also `closestNode`, so lets associate those heuristics
		this.cache.set(start, closestNodeHeuristics);

		this.heap.push(start);

		while (this.heap.size() > 0) {
			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			const currentNode = this.heap.pop();
			const currentNodeHeuristics = this.cache.get(currentNode);
			if (!currentNodeHeuristics) {
				throw new Error('Somehow opening a node that has no heuristic data');
			}

			// End case -- result has been found, return the traced path.
			if (currentNode.equals(end)) {
				return this.tracePath(currentNodeHeuristics);
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbors.
			currentNodeHeuristics.closed = true;

			// Find all neighbors for the current node.
			const neighbors = this.terrain.getNeighborTiles(currentNode);

			for (let i = 0, il = neighbors.length; i < il; ++i) {
				const neighbor = neighbors[i];
				let neighborHeuristics = this.cache.get(neighbor);

				if (neighborHeuristics?.closed || !neighbor.isLand()) {
					// Not a valid node to process, skip to next neighbor.
					continue;
				}

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
				const gScore =
					currentNodeHeuristics.g +
					getVisitationCost(this.terrain, currentNode, neighbor);
				const beenVisited = !!neighborHeuristics;

				if (!beenVisited || (neighborHeuristics && gScore < neighborHeuristics.g)) {
					const hScore = this.heuristic(neighbor, end);
					// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
					neighborHeuristics = {
						coordinate: neighbor,
						h: hScore,
						g: gScore,
						f: gScore + hScore,
						parent: currentNodeHeuristics,
						closed: true,
						visited: true
					};
					this.cache.set(neighbor, neighborHeuristics as HeuristicReport);

					if (this.options.closest) {
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
						this.heap.push(neighbor);
					} else {
						// Already seen the node, but since it has been rescored we need to reorder it in the heap
						this.heap.rescoreElement(neighbor);
					}
				}
			}
		}

		if (this.options.closest) {
			return this.tracePath(closestNodeHeuristics);
		}

		// No result was found - empty array signifies failure to find path.
		console.warn('-- No path --');
		return [];
	}

	tracePath(heuristicReport: HeuristicReport) {
		let curr = heuristicReport;
		const path = [];
		while (curr.parent) {
			path.unshift(curr);
			curr = curr.parent;
		}
		return path.map(heuristicReport => heuristicReport.coordinate);
	}
}
