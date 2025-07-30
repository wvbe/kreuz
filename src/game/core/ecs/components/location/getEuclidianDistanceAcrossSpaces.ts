import { QualifiedCoordinate, TerrainI } from '../../../terrain/types';
import { getEuclidianDistance } from './getEuclidianDistance';

/**
 * @note Does not count distance for passing into anotehr space.
 */
export function getEuclidianDistanceAcrossSpaces(
	start: QualifiedCoordinate,
	finish: QualifiedCoordinate,
) {
	if (start.length !== 4 || finish.length !== 4) {
		throw new Error('Start or finish location is not qualified');
	}
	const [startSpace, ...startCoords] = start;
	const [finishSpace, ...finishCoords] = finish;

	let commonAncestor: TerrainI | null = null;
	const finishAncestorsToCommonAncestor: TerrainI[] = [];
	if (startSpace === finishSpace) {
		// This is a common case, so its worth avoiding a little extra work
		commonAncestor = startSpace;
		finishAncestorsToCommonAncestor.push(finishSpace);
	} else {
		const startAncestors = startSpace.getAncestors();
		const finishAncestors = finishSpace.getAncestors();
		commonAncestor =
			[startSpace, ...startAncestors].find((ancestor) =>
				[finishSpace, ...finishAncestors].includes(ancestor),
			) ?? null;
		if (!commonAncestor) {
			throw new Error('No common ancestor found');
		}
		finishAncestorsToCommonAncestor.push(
			finishSpace,
			...finishAncestors.slice(0, finishAncestors.indexOf(commonAncestor)),
		);
	}

	let totalDistance = 0,
		currentSpace = startSpace,
		currentCoords = startCoords;

	while (currentSpace !== commonAncestor) {
		const nextSpace = currentSpace.getParent()!;
		const child = nextSpace.children.find((child) => child.terrain === currentSpace);
		if (!child) {
			throw new Error('Child not found');
		}
		totalDistance +=
			getEuclidianDistance(currentCoords, currentSpace.entryLocation!) *
			currentSpace.sizeMultiplier;
		currentSpace = nextSpace;
		currentCoords = child.location;
	}

	while (currentSpace !== finishSpace) {
		const nextSpace = finishAncestorsToCommonAncestor.pop();
		const child = currentSpace.children.find((child) => child.terrain === nextSpace);
		if (!child) {
			throw new Error('Child not found');
		}
		totalDistance +=
			getEuclidianDistance(currentCoords, child.location) * currentSpace.sizeMultiplier;
		currentSpace = child.terrain!;
		currentCoords = child.terrain.entryLocation!;
	}

	totalDistance +=
		getEuclidianDistance(currentCoords, finishCoords) * currentSpace.sizeMultiplier;

	return totalDistance;
}
