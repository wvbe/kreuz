import { FilterFn } from '../../../types';

export function getContiguousObjects<T>(
	start: T,
	getNeighbours: (object: T) => T[],
	selector: FilterFn<T> = (tile) => true,
	// selector: FilterFn<T> = (tile) => tile.walkability > 0,
	inclusive = true,
): T[] {
	const island: T[] = [];
	const seen: T[] = [];
	const queue: T[] = [start];

	while (queue.length) {
		const current = queue.shift()!;
		if (inclusive || current !== start) {
			island.push(current);
		}
		const neighbours = getNeighbours(current).filter((n) => !seen.includes(n));
		seen.splice(0, 0, current, ...neighbours);
		queue.splice(0, 0, ...neighbours.filter(selector));
	}
	return island;
}
