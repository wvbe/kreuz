import { QualifiedCoordinate } from '../../../terrain/types';

export function getTerrainHopsBetweenCoordinates(
	[startTerrain]: QualifiedCoordinate,
	[destinationTerrain]: QualifiedCoordinate,
) {
	if (startTerrain === destinationTerrain) {
		return [destinationTerrain];
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

	return [
		startTerrain,
		...startAncestors.slice(0, startAncestors.indexOf(commonAncestor)),
		commonAncestor,
		...destinationAncestors.slice(0, destinationAncestors.indexOf(commonAncestor)).reverse(),
		destinationTerrain,
	];
}
