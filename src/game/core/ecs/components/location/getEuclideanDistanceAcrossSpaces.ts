import { Terrain } from '../../../terrain/Terrain';
import { QualifiedCoordinate } from '../../../terrain/types';
import { getEuclideanDistance } from './getEuclideanDistance';

/**
 * @note Does not count distance for passing into anotehr space.
 */
export function getEuclideanDistanceAcrossSpaces(
	start: QualifiedCoordinate,
	destination: QualifiedCoordinate,
) {
	if (start.length !== 4 || destination.length !== 4) {
		throw new Error('Start or destination location is not qualified');
	}
	const [startTerrain, ...startCoords] = start;
	const [destinationTerrain, ...destinationCoords] = destination;

	let commonAncestor: Terrain | null = null;
	const destinationAncestorsToCommonAncestor: Terrain[] = [];
	if (startTerrain === destinationTerrain) {
		// This is a common case, so its worth avoiding a little extra work
		commonAncestor = startTerrain;
		destinationAncestorsToCommonAncestor.push(destinationTerrain);
	} else {
		const startAncestors = startTerrain.getAncestors();
		const destinationAncestors = destinationTerrain.getAncestors();
		commonAncestor =
			[startTerrain, ...startAncestors].find((ancestor) =>
				[destinationTerrain, ...destinationAncestors].includes(ancestor),
			) ?? null;
		if (!commonAncestor) {
			throw new Error('No common ancestor found');
		}
		destinationAncestorsToCommonAncestor.push(
			destinationTerrain,
			...destinationAncestors.slice(0, destinationAncestors.indexOf(commonAncestor)),
		);
	}

	let totalDistance = 0,
		currentTerrain = startTerrain,
		currentCoords = startCoords;

	// Travel up, towards the common ancestor
	while (currentTerrain !== commonAncestor) {
		const portalToParent = currentTerrain.getPortalToParent();
		if (!portalToParent) {
			throw new Error('Portal to parent not found');
		}
		totalDistance +=
			getEuclideanDistance(currentCoords, portalToParent.portalStart) *
			currentTerrain.sizeMultiplier;

		// Get this value before we change the current terrain

		currentCoords = portalToParent.terrain.getLocationOfPortalToTerrain(currentTerrain);
		currentTerrain = portalToParent.terrain;
	}

	// Travel down, along the destination terrain's ancestry
	while (currentTerrain !== destinationTerrain) {
		const childTerrain = destinationAncestorsToCommonAncestor.pop()!;
		const portalToChild = currentTerrain.getPortalToChild(childTerrain);
		totalDistance +=
			getEuclideanDistance(currentCoords, portalToChild.portalStart) *
			currentTerrain.sizeMultiplier;

		currentCoords = childTerrain.getLocationOfPortalToTerrain(currentTerrain);
		currentTerrain = childTerrain;
	}

	totalDistance +=
		getEuclideanDistance(currentCoords, destinationCoords) * currentTerrain.sizeMultiplier;

	return totalDistance;
}
