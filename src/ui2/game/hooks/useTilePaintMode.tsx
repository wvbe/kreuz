import { ColorInstance } from 'color';
import { useCallback, useEffect, useRef } from 'react';
import { locationComponent } from '../../../lib/level-1/ecs/components/locationComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import Game from '../../../lib/level-1/Game';
import { type SimpleCoordinate } from '../../../lib/level-1/terrain/types';
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

function getTilesInRange(game: Game, start: SimpleCoordinate, end: SimpleCoordinate) {
	const tiles: HihglightableTile[] = [];
	for (let x = Math.min(start[0], end[0]); x <= Math.max(start[0], end[0]); x++) {
		for (let y = Math.min(start[1], end[1]); y <= Math.max(start[1], end[1]); y++) {
			tiles.push(game.terrain.getTileClosestToXy(x, y));
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
		dragStatus.current.end = tile.location.get();

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
