import { pathableComponent } from '../core/ecs/components/pathableComponent';
import { EcsEntity } from '../core/ecs/types';

export enum FindInPatheableOrderResult {
	IGNORE,
	INCLUDE,
	STOP,
	INCLUDE_AND_STOP,
}

/**
 * Finds the hops to the selected patheables. Starts at `start` and explores the adjacent patheables
 * until we run out of neighbours' neighbours, or until `STOP` order or `INCLUDE_AND_STOP` order is
 * returned. Returning `INCLUDE` or `INCLUDE_AND_STOP` will add the patheable to the results. Every
 * result will reference the tile and the amount of hops to get to it.
 *
 * @param start - The starting patheable.
 * @param selector - A function that returns a result for each patheable.
 * @returns An array of objects containing the distance and the patheable.
 */
export function findHopsToSelectedPatheables<X extends EcsEntity<typeof pathableComponent>>(
	start: X,
	selector: (tile: X) => void | FindInPatheableOrderResult,
): { hops: number; tile: X }[] {
	const unexplored: [number, X][] = [[0, start]];
	const explored: X[] = [];
	const results: { hops: number; tile: X }[] = [];
	while (unexplored.length > 0) {
		const [hops, tile] = unexplored.shift()!;
		const evalled = selector(tile);
		if (
			evalled === FindInPatheableOrderResult.INCLUDE ||
			evalled === FindInPatheableOrderResult.INCLUDE_AND_STOP
		) {
			results.push({ hops, tile });
		}
		if (
			evalled === FindInPatheableOrderResult.STOP ||
			evalled === FindInPatheableOrderResult.INCLUDE_AND_STOP
		) {
			break;
		}
		if (!explored.includes(tile)) {
			explored.push(tile);
			unexplored.push(
				...(tile.pathingNeighbours as X[])
					.filter((neighbour) => !explored.includes(neighbour))
					.map<[number, X]>((neighbour) => [hops + 1, neighbour]),
			);
		}
	}
	return results;
}
