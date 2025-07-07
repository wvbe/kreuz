import Color, { ColorInstance } from 'color';
import { createContext, useContext, useMemo } from 'react';
import { locationComponent } from '../../../lib/level-1/ecs/components/locationComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';
import { EventedValueMap } from '../../../lib/level-1/events/EventedValueMap';
import { useEventedValue } from '../../../ui/hooks/useEventedValue';

type HighlightContext = {
	color: ColorInstance;
	tiles: EventedValueMap<EcsEntity<typeof locationComponent>, boolean>;
};

const highlightContext = createContext<HighlightContext>({
	color: new Color('white'),
	tiles: new EventedValueMap(false),
});

// export const TileHighlightsProvider: FC<PropsWithChildren> = ({ children }) => {
// 	const derp = useRef<HighlightContext>({
// 		color: new Color('purple'),
// 		tiles: new EntityMetadataRegistry<any, boolean>(false),
// 	});
// 	return <highlightContext.Provider value={derp.current}>{children}</highlightContext.Provider>;
// };

export function useTileHighlightsContext() {
	const context = useContext(highlightContext);
	if (!context) {
		throw new Error('useTileHighlights must be used within a TileHighlightsProvider');
	}

	return context;
}

export function getTileIdForHighlights(tile: EcsEntity<typeof locationComponent>): string;
export function getTileIdForHighlights(x: number, y: number): string;
export function getTileIdForHighlights(
	tileOrx: EcsEntity<typeof locationComponent> | number,
	tileY?: number,
): string {
	const x = typeof tileOrx === 'number' ? tileOrx : tileOrx.location.get()[0];
	const y = typeof tileOrx === 'number' ? tileY : tileOrx.location.get()[1];
	return `${x},${y}`;
}

/**
 * Returns whether the tile is highlighted and the color of the highlights. Intended to be used
 * in the component for a specific tile.
 */
export function useTileHighlights(tile: EcsEntity<typeof locationComponent>) {
	const context = useTileHighlightsContext(),
		eventedValue = useMemo(() => context.tiles.get(tile), [context.tiles, tile]);
	return {
		isHighlighted: useEventedValue(eventedValue),
		highlightColor: context.color,
	};
}
