import { Action } from '../../../ui/actions/types';
import { SelectionOverlay, selectionOverlays } from '../../../ui/game/GameMapSelectionOverlays';
import { createRectangularSelectionListeners } from '../../../ui/selections/createRectangularSelectionListeners';
import { getTileCoordinatesInRectangle } from '../../../ui/selections/rectangle/getTileCoordinatesInRectangle';
import { JobPriority } from '../../core/classes/JobBoard';
import { Tile, tileArchetype } from '../../core/ecs/archetypes/tileArchetype';
import { assertEcsComponents, hasEcsComponents } from '../../core/ecs/assert';
import { getTileAtLocation } from '../../core/ecs/components/location/getTileAtLocation';
import { isMapLocationEqualTo } from '../../core/ecs/components/location/isMapLocationEqualTo';
import { locationComponent } from '../../core/ecs/components/locationComponent';
import { rawMaterialComponent } from '../../core/ecs/components/rawMaterialComponent';
import { SurfaceType } from '../../core/ecs/components/surfaceComponent';
import { EventedValue } from '../../core/events/EventedValue';
import Game from '../../core/Game';
import { QualifiedCoordinate } from '../../core/terrain/types';
import { ExcavationJob } from './jobs/ExcavationJob';

/**
 * Get all tiles within the rectanglar selection, or JIT create them if they don't exist
 */
async function getOrCreateTilesInRectangle(start: QualifiedCoordinate, end: QualifiedCoordinate) {
	const newTiles: Tile[] = [];
	const tiles = getTileCoordinatesInRectangle(start, end).map((coordinate) => {
		const existing = getTileAtLocation(coordinate, true);
		if (existing) {
			return existing;
		}

		const tile = tileArchetype.create({
			location: coordinate,
			surfaceType: SurfaceType.UNKNOWN,
		});

		newTiles.push(tile);
		return tile;
	});
	await tiles?.[0].location.get()[0].tiles.add(...newTiles);
	return tiles;
}

async function createRectangularSelectionVisualizationAndReturnTiles() {
	const overlay: SelectionOverlay = {
		tileCoordinates: new EventedValue<QualifiedCoordinate[]>([]),
		colors: {
			background: '#ffe24966',
			border: '#ffe249',
		},
	};
	await selectionOverlays.add(overlay);

	const { $change, promise } = createRectangularSelectionListeners();
	const destroyChangeListener = $change.on(async ({ start, end }) => {
		overlay.tileCoordinates.set(getTileCoordinatesInRectangle(start, end));
	});

	const rectangle = await promise();

	destroyChangeListener();
	await selectionOverlays.remove(overlay);

	if (!rectangle) {
		// User cancelled
		return;
	}

	return getOrCreateTilesInRectangle(rectangle.start, rectangle.end);
}

export const excavatorButton: Action = {
	icon: '⛏',
	label: 'Clear',
	onClick: async (game: Game) => {
		const tiles = await createRectangularSelectionVisualizationAndReturnTiles();
		if (!tiles) {
			return;
		}

		for (const tile of tiles) {
			if (
				tile.surfaceType.get() === SurfaceType.OPEN ||
				!ExcavationJob.canModifyTile(game, tile)
			) {
				continue;
			}
			game.jobs.add(
				JobPriority.NORMAL,
				new ExcavationJob(tile, {
					onSuccess: async (tile) => {
						await game.time.wait(30_000);
						tile.walkability = 1;
						tile.surfaceType.set(SurfaceType.OPEN);
					},
				}),
			);
		}
	},
};

export const fillButton: Action = {
	icon: '🪏',
	label: 'Fill',
	onClick: async (game: Game) => {
		const tiles = await createRectangularSelectionVisualizationAndReturnTiles();
		if (!tiles) {
			return;
		}

		for (const tile of tiles) {
			const entitiesInSameLocation = game.entities.find(
				(entity) =>
					hasEcsComponents(entity, [locationComponent]) &&
					isMapLocationEqualTo(entity.location.get(), tile.location.get()),
			);
			if (
				tile.surfaceType.get() === SurfaceType.UNKNOWN ||
				!ExcavationJob.canModifyTile(game, tile) ||
				entitiesInSameLocation
			) {
				continue;
			}
			game.jobs.add(
				JobPriority.NORMAL,
				new ExcavationJob(tile, {
					onSuccess: async (tile) => {
						await game.time.wait(30_000);
						tile.walkability = 0;
						tile.surfaceType.set(SurfaceType.UNKNOWN);
					},
				}),
			);
		}
	},
};

export const harvestButton: Action = {
	icon: '🍴',
	label: 'Harvest',
	onClick: async (game: Game) => {
		const tiles = await createRectangularSelectionVisualizationAndReturnTiles();
		if (!tiles) {
			return;
		}

		for (const tile of tiles) {
			const entitiesInSameLocation = game.entities.filter(
				(entity) =>
					hasEcsComponents(entity, [rawMaterialComponent]) &&
					isMapLocationEqualTo(entity.location.get(), tile.location.get()),
			);
			if (!entitiesInSameLocation.length) {
				continue;
			}
			for (const entity of entitiesInSameLocation) {
				game.jobs.add(
					JobPriority.NORMAL,
					new ExcavationJob(tile, {
						onSuccess: async () => {
							assertEcsComponents(entity, [rawMaterialComponent]);

							await Promise.all(
								entity.rawMaterials.map(async ({ material }) => {
									const quantity = await entity.harvestRawMaterial(
										game,
										material,
									);
									return { quantity, material };
								}),
							);
						},
					}),
				);
			}
		}
	},
};
