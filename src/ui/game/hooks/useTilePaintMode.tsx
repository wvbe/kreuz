import { ColorInstance } from 'color';
import { useCallback, useEffect, useRef } from 'react';
import { locationComponent } from '../../../game/core/ecs/components/locationComponent';
import { EcsEntity } from '../../../game/core/ecs/types';
import Game from '../../../game/core/Game';
import { type SimpleCoordinate } from '../../../game/core/terrain/types';
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
	start: SimpleCoordinate;
	end: SimpleCoordinate;
};

type DragCallback = (tile: HihglightableTile) => void;

/**
 * @TODO use qualified coordinates
 */
function getTilesInRange(game: Game, start: SimpleCoordinate, end: SimpleCoordinate) {
	const tiles: HihglightableTile[] = [];
	for (let x = Math.min(start[0], end[0]); x <= Math.max(start[0], end[0]); x++) {
		for (let y = Math.min(start[1], end[1]); y <= Math.max(start[1], end[1]); y++) {
			const tile = game.terrain.getTileAtMapLocation([x, y, 0], true);
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
			start: location.slice(1) as SimpleCoordinate,
			end: location.slice(1) as SimpleCoordinate,
		};

		void tileHighlightsContext.tiles.set(tile, true);

		window.addEventListener('mouseup', () => {
			if (!dragStatus.current || !onDragCompleteRef.current) {
				return;
			}

			onDragCompleteRef.current?.(
				getTilesInRange(gameContext, dragStatus.current.start, dragStatus.current.end),
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
		dragStatus.current.end = tile.location.get().slice(1) as SimpleCoordinate;

		const added = new Set<HihglightableTile>();
		for (
			let x = Math.min(dragStatus.current.start[0], dragStatus.current.end[0]);
			x <= Math.max(dragStatus.current.start[0], dragStatus.current.end[0]);
			x++
		) {
			for (
				let y = Math.min(dragStatus.current.start[1], dragStatus.current.end[1]);
				y <= Math.max(dragStatus.current.start[1], dragStatus.current.end[1]);
				y++
			) {
				const tile = gameContext.terrain.getTileClosestToXy(x, y);
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
