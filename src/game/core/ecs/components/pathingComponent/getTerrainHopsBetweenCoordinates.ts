import { QualifiedCoordinate } from '../../../terrain/types';

export function getTerrainHopsBetweenCoordinates(
	[startTerrain]: QualifiedCoordinate,
	[destinationTerrain]: QualifiedCoordinate,
) {
	if (startTerrain === destinationTerrain) {
		return [];
	}

	const startAncestors = startTerrain.getAncestors(),
		destinationAncestors = destinationTerrain.getAncestors(),
		commonAncestor =
			[startTerrain, ...startAncestors].find((ancestor) =>
				[destinationTerrain, ...destinationAncestors].includes(ancestor),
			) ?? null;
	if (!commonAncestor) {
		throw new Error('No common ancestor found');
	}

	// The steps between the start and the common ancestor
	const hops = startAncestors.slice(0, startAncestors.indexOf(commonAncestor));

	if (startTerrain !== commonAncestor) {
		hops.push(commonAncestor);
	}

	// The steps between the common ancestor and the destination
	hops.push(
		...destinationAncestors.slice(0, destinationAncestors.indexOf(commonAncestor)).reverse(),
	);

	if (commonAncestor !== destinationTerrain) {
		hops.push(destinationTerrain);
	}

	return hops;
}
