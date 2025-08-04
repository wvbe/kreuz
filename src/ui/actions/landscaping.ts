import { ExcavationJob } from '../../game/assets/commands/ExcavationJob';
import { JobPriority } from '../../game/core/classes/JobBoard';
import { Tile, tileArchetype } from '../../game/core/ecs/archetypes/tileArchetype';
import { hasEcsComponents } from '../../game/core/ecs/assert';
import { getTileAtLocation } from '../../game/core/ecs/components/location/getTileAtLocation';
import { isMapLocationEqualTo } from '../../game/core/ecs/components/location/isMapLocationEqualTo';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { SurfaceType } from '../../game/core/ecs/components/surfaceComponent';
import { EventedValue } from '../../game/core/events/EventedValue';
import Game from '../../game/core/Game';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { selectionOverlays } from '../game/GameMapSelectionOverlays';
import { createRectangularSelectionListeners } from '../selections/createRectangularSelectionListeners';
import { getTileCoordinatesInRectangle } from '../selections/rectangle/getTileCoordinatesInRectangle';
import { Action } from './types';

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
	const overlay = {
		tileCoordinates: new EventedValue<QualifiedCoordinate[]>([]),
		colors: {
			background: '#ffe24966',
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
					onSuccess: (tile) => {
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
					onSuccess: (tile) => {
						tile.walkability = 0;
						tile.surfaceType.set(SurfaceType.UNKNOWN);
					},
				}),
			);
		}
	},
};
