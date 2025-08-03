import { Tile, tileArchetype } from '../../../game/core/ecs/archetypes/tileArchetype';
import { SurfaceType } from '../../../game/core/ecs/components/surfaceComponent';
import { QualifiedCoordinate, SimpleCoordinate } from '../../../game/core/terrain/types';
import { getViewportControls } from '../../stores/selectedActionStore';

type DragStatus = {
	start: QualifiedCoordinate;
	end: QualifiedCoordinate;
};

/**
 * When enabled, dragging the mouse across the map will select that rectangular area.
 */
export class RectangularSelectionTool {
	private constructor(
		private readonly options: {
			createJitTilesForSelection?: boolean;
		} = {},
	) {}

	private setEventListener(
		onMakeSelection: (
			dragStatus: DragStatus | null,
			error: Error | null,
		) => void | Promise<void>,
		onBeforeMakeSelection: (dragStatus: DragStatus) => void,
	) {
		const panzoomControls = getViewportControls();
		const element = panzoomControls.getPanzoomContainer();

		let dragStatus: DragStatus | null = null;

		function onMouseDown({ x, y }: MouseEvent) {
			const coordinate = panzoomControls.getCoordinateFromContainerPixels(x, y);
			dragStatus = { start: coordinate, end: coordinate };

			onBeforeMakeSelection(dragStatus);

			element.addEventListener('mousemove', onMouseMove);
			element.ownerDocument.addEventListener('mouseup', onMouseUp, { once: true });
			element.ownerDocument.addEventListener('contextmenu', onContextMenu, { once: true });
		}
		function onContextMenu() {
			dragStatus = null;
			onMakeSelection(null, null);

			element.removeEventListener('mousemove', onMouseMove);
			element.ownerDocument.removeEventListener('mouseup', onMouseUp);
			element.ownerDocument.removeEventListener('contextmenu', onContextMenu);
		}
		function onMouseMove({ x, y }: MouseEvent) {
			if (!dragStatus) {
				throw new Error('Could not find the expected mouse drag status');
			}
			const coordinate = panzoomControls.getCoordinateFromContainerPixels(x, y);
			dragStatus.end = coordinate;
		}
		async function onMouseUp() {
			if (!dragStatus) {
				throw new Error('Could not find the expected mouse drag status');
			}

			const copy = { ...dragStatus };
			dragStatus = null;

			// Destroy all except the mousedown event;
			element.removeEventListener('mousemove', onMouseMove);
			element.ownerDocument.removeEventListener('mouseup', onMouseUp);
			element.ownerDocument.removeEventListener('contextmenu', onContextMenu);

			await onMakeSelection(copy, null);
		}

		element.addEventListener('mousedown', onMouseDown);

		return () => {
			element.removeEventListener('mousedown', onMouseDown);
			element.removeEventListener('mousemove', onMouseMove);
			element.ownerDocument.removeEventListener('mouseup', onMouseUp);
			element.ownerDocument.removeEventListener('contextmenu', onContextMenu);
		};
	}

	public static async asPromise(
		options: {
			createJitTilesForSelection?: boolean;
		} = {},
	) {
		const inst = new RectangularSelectionTool(options);

		return new Promise<Tile[] | null>((resolve, reject) => {
			const cancelDomListeners = inst.setEventListener(
				async (dragStatus, error) => {
					cancelDomListeners();

					if (error) {
						reject(error);
						return;
					}

					const newTiles: Tile[] = [];

					const tiles = dragStatus
						? RectangularSelectionTool.getAllTilesInRectangle(
								dragStatus.start,
								dragStatus.end,
								options.createJitTilesForSelection
									? (coordinate: QualifiedCoordinate) => {
											const tile = tileArchetype.create({
												location: coordinate,
												surfaceType: SurfaceType.UNKNOWN,
											});

											newTiles.push(tile);
											return tile;
									  }
									: null,
						  )
						: // If no drag status, the user cancelled the selection.
						  null;
					await tiles?.[0].location.get()[0].tiles.add(...newTiles);

					resolve(tiles);
				},
				() => {},
			);
		});
	}

	public static getTileCoordinatesInRectangle(
		start: QualifiedCoordinate,
		end: QualifiedCoordinate,
	) {
		const tiles: QualifiedCoordinate[] = [];
		const [startTerrain, startX, startY] = start;
		const [_endTerrain, endX, endY] = end;
		for (
			let x = Math.round(Math.min(startX, endX));
			x <= Math.round(Math.max(startX, endX));
			x++
		) {
			for (
				let y = Math.round(Math.min(startY, endY));
				y <= Math.round(Math.max(startY, endY));
				y++
			) {
				tiles.push([startTerrain, Math.round(x), Math.round(y), 0]);
			}
		}
		return tiles;
	}

	/**
	 * Get all tiles in the rectangle, creating just-in-time tiles if necessary (see `options.createJitTilesForSelection`)
	 */
	public static getAllTilesInRectangle(
		start: QualifiedCoordinate,
		end: QualifiedCoordinate,
		createJustInTime?: null | ((coordinate: QualifiedCoordinate) => Tile),
	) {
		const justInTime = this.getTileCoordinatesInRectangle(start, end).map(
			(coordinate) =>
				coordinate[0].getTileAtMapLocation(coordinate.slice(1) as SimpleCoordinate, true) ??
				createJustInTime?.(coordinate),
		);

		return justInTime.filter((tile): tile is Tile => Boolean(tile));
	}
}
