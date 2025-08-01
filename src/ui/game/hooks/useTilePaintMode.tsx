import { ColorInstance } from 'color';
import { useCallback, useEffect, useRef } from 'react';
import { locationComponent } from '../../../game/core/ecs/components/locationComponent';
import { EcsEntity } from '../../../game/core/ecs/types';
import { QualifiedCoordinate } from '../../../game/core/terrain/types';
import { useGameContext } from '../../contexts/GameContext';
import { usePanZoomControls } from '../../util/PanZoomable';
import { useTileHighlightsContext } from './useTileHighlights';

export type HihglightableTile = EcsEntity<typeof locationComponent>;

export type TilePaintMode = {
	id: string;
	highlightColor: ColorInstance;
	onDragComplete: (tiles: HihglightableTile[]) => void;
};

type DragStatus = {
	start: QualifiedCoordinate;
	end: QualifiedCoordinate;
};

type DragCallback = (tile: HihglightableTile) => void;

/**
 * @TODO use qualified coordinates
 */
function getTilesInRange(start: QualifiedCoordinate, end: QualifiedCoordinate) {
	const tiles: HihglightableTile[] = [];
	const [startTerrain, startX, startY, startZ] = start;
	const [endTerrain, endX, endY, endZ] = end;
	for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
		for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
			const tile = startTerrain.getTileAtMapLocation([startTerrain, x, y, 0], true);
			if (tile) {
				tiles.push(tile);
			}
		}
	}
	return tiles;
}

export function useTilePaintMode(currentMode: TilePaintMode | null): {
	onTileMouseDown: DragCallback;
	onTileMouseEnter: DragCallback;
} {
	const gameContext = useGameContext();
	const dragStatus = useRef<null | DragStatus>(null);
	const { setIsPaused } = usePanZoomControls();

	const tileHighlightsContext = useTileHighlightsContext();

	const onDragCompleteRef = useRef(currentMode?.onDragComplete);
	useEffect(() => {
		if (currentMode) {
			setIsPaused(true);
			onDragCompleteRef.current = currentMode?.onDragComplete;
		} else {
			setIsPaused(false);
			onDragCompleteRef.current = undefined;
		}
	}, [currentMode]);

	const onTileMouseDown = useCallback<DragCallback>((tile) => {
		if (dragStatus.current) {
			throw new Error('Invalid state, drag status already set');
		}
		if (!onDragCompleteRef.current) {
			return;
		}

		const location = tile.location.get();
		dragStatus.current = {
			start: location,
			end: location,
		};

		void tileHighlightsContext.tiles.set(tile, true);

		window.addEventListener('mouseup', () => {
			if (!dragStatus.current || !onDragCompleteRef.current) {
				return;
			}

			onDragCompleteRef.current?.(
				getTilesInRange(dragStatus.current.start, dragStatus.current.end),
			);
			dragStatus.current = null;
			tileHighlightsContext.tiles.forEach((value, key) => {
				if (value) {
					void tileHighlightsContext.tiles.set(key, false);
				}
			});
		});
	}, []);

	const onTileMouseEnter = useCallback<DragCallback>((tile) => {
		if (!dragStatus.current) {
			// No drag in progress
			return;
		}
		dragStatus.current.end = tile.location.get();

		const added = new Set<HihglightableTile>();
		for (
			let x = Math.min(dragStatus.current.start[1], dragStatus.current.end[1]);
			x <= Math.max(dragStatus.current.start[1], dragStatus.current.end[1]);
			x++
		) {
			for (
				let y = Math.min(dragStatus.current.start[2], dragStatus.current.end[2]);
				y <= Math.max(dragStatus.current.start[2], dragStatus.current.end[2]);
				y++
			) {
				const tile = dragStatus.current.start[0].getTileClosestToXy(x, y);
				added.add(tile);
				void tileHighlightsContext.tiles.set(tile, true);
			}
		}
		tileHighlightsContext.tiles.forEach((value, key) => {
			if (value && !added.has(key)) {
				void tileHighlightsContext.tiles.set(key, false);
			}
		});
	}, []);

	return { onTileMouseDown, onTileMouseEnter };
}
