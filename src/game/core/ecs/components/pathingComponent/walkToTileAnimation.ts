import Game from '../../../Game';
import { QualifiedCoordinate } from '../../../terrain/types';
import { Tile, tileArchetype } from '../../archetypes/tileArchetype';
import { hasEcsComponents } from '../../assert';
import { EcsEntity } from '../../types';
import { healthComponent } from '../healthComponent';
import { getTileAtLocation } from '../location/getTileAtLocation';
import { isMapLocationEqualTo } from '../location/isMapLocationEqualTo';
import { locationComponent } from '../locationComponent';
import { pathingComponent } from '../pathingComponent';
import { visibilityComponent } from '../visibilityComponent';
import { Path } from './Path';

export type PathingEntity = EcsEntity<typeof locationComponent | typeof pathingComponent>;

async function animateTo(entity: PathingEntity, destination: QualifiedCoordinate) {
	const distance = entity.euclideanDistanceTo(destination);
	const [currentTerrain, ...currentCoords] = entity.location.get();
	const portal = currentTerrain
		.getPortals()
		.find(
			({ terrain, portalStart }) =>
				isMapLocationEqualTo(portalStart, currentCoords) &&
				isMapLocationEqualTo(destination, [
					terrain,
					...terrain.getLocationOfPortalToTerrain(currentTerrain),
				]),
		);
	await entity.$stepStart.set({
		destination,
		duration: distance / entity.walkSpeed,
		done: async () => {
			if (portal) {
				await entity.$portalExited.emit(portal);
			}
			await entity.$stepEnd.emit(destination);
		},
	});
	if (portal) {
		await entity.$portalEntered.emit(portal);
	}
}
async function animateAlongPath(entity: PathingEntity, path: Tile[]) {
	// @TODO add some safety checks on the path maybe.
	// Emitting this event may prompt the promises of other walkOnTile tasks to reject.
	const nextTileInPath = path.shift();
	if (!nextTileInPath) {
		return;
	}

	await entity.$path.set(path);

	let nextStepIndex = 0;
	const unlisten = entity.$stepEnd.on(async (coordinate) => {
		entity.location.set(coordinate);
		const nextStep = path[nextStepIndex++];
		if (!nextStep) {
			unlisten();
			unlistenNewPath();
			await entity.$path.set(null);
		} else {
			await animateTo(entity, nextStep.location.get());
		}
	});

	// If another .walkAlongPath call interrupts us, stop listening for our own $stepEnd events.
	// @TODO this is untested
	const unlistenNewPath = entity.$path.once((path) => {
		if (path) {
			unlistenNewPath();
			unlisten();
		}
	});

	const promise = new Promise<void>((resolve, reject) => {
		const stopListeningForDeath =
			// Walking around may be stopped by death, ie. there is a dependency on healthComponent,
			// but having health is not a prerequisite.
			(entity as unknown as EcsEntity<typeof healthComponent>).$death?.on(() => {
				cancelWalk();
			});

		const stopListeningForFinish = entity.$path.on((path) => {
			if (path === null) {
				stopListeningForFinish();
				stopListeningForDeath();
				resolve();
			}
		});
		const cancelWalk = () => {
			stopListeningForFinish();
			stopListeningForDeath();
			reject();
		};
	});

	// Take the first step to kick off this event chain;
	await animateTo(entity, nextTileInPath.location.get());

	return promise;
}

function findPath(
	game: Game,
	entity: PathingEntity,
	destination: Tile,
	stopAtDistanceToTarget: number,
) {
	// Its _possible_ that an entity lives on a tile that has so much elevation that
	// .getTileClosestToXy actually finds the _wrong_ tile -- because its neighbor is closer than
	// the proximity to z=0. In that case, there is a bug:
	//
	// const start = terrain.getTileClosestToXy(this.location.get().x, this.location.get().y);
	//
	// To work around the bug, and as a cheaper option, find the tile whose XY is equal to the current
	// location. The only downsize is that entities that are mid-way a tile will not find one. Since
	// this is not a feature yet, we can use it regardless:
	const start = getTileAtLocation(entity.location.get());
	if (!start) {
		throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
	}
	const path = Path.between(start, destination, {
		closest: true,
		obstacles: game.entities
			.filter(
				(entity) =>
					!tileArchetype.test(entity) &&
					hasEcsComponents(entity, [locationComponent, visibilityComponent]),
			)
			.map((entity) => ({
				coordinate: (entity as EcsEntity<typeof locationComponent>).location.get(),
				cost: 12,
			})),
	});

	const lastTileInPath = path[path.length - 1];
	if (lastTileInPath) {
		const distanceToTarget = destination.euclideanDistanceTo(lastTileInPath.location.get());
		if (distanceToTarget > stopAtDistanceToTarget) {
			throw new Error('Could not find a path close enough to the target');
		}
	}

	return path;
}

export async function walkToTile(
	entity: PathingEntity,
	game: Game,
	destinationOrPath: Tile | Tile[],
	stopAtDistanceToTarget: number = 0,
) {
	if (!locationComponent.test(entity) || !pathingComponent.test(entity)) {
		throw new Error(`Entity ${entity} is unable to walk`);
	}

	const path = Array.isArray(destinationOrPath)
		? destinationOrPath
		: findPath(game, entity, destinationOrPath, stopAtDistanceToTarget);
	await animateAlongPath(entity, path);
}
