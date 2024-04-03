import {
	EcsEntity,
	Random,
	SurfaceType,
	locationComponent,
	outlineComponent,
	pathableComponent,
	surfaceComponent,
} from '@lib';
import Color from 'color';
import React, { MouseEventHandler, useCallback, useMemo, type FunctionComponent } from 'react';
import { useMapTileContextMenu } from './MAP_TILE_CONTEXT_MENU.ts';
import { useEventedValue } from '../hooks/useEventedValue.ts';

// <palette>
// 	<color name='dry-grass-patches-1' rgb='A09E55' r='160' g='158' b='84' />
// 	<color name='dry-grass-patches-2' rgb='8F8A49' r='142' g='137' b='73' />
// 	<color name='dry-grass-patches-3' rgb='6D733D' r='109' g='114' b='61' />
// 	<color name='dry-grass-patches-4' rgb='828034' r='130' g='128' b='52' />
// 	<color name='dry-grass-patches-5' rgb='AE9F68' r='174' g='158' b='103' />
// </palette>

const baseGreen = Color('#8F8A49');
const baseBlue = Color('#234A59');

export const MapTile: FunctionComponent<{
	zoom: number;
	tile: EcsEntity<
		| typeof pathableComponent
		| typeof outlineComponent
		| typeof locationComponent
		| typeof surfaceComponent
	>;
}> = ({ tile, zoom }) => {
	const color = useEventedValue(tile.surfaceType, (surfaceType) =>
		(surfaceType === SurfaceType.UNKNOWN ? baseBlue : baseGreen)
			.lighten(Random.between(-0.05, 0.05, tile.toString(), 'lighten'))
			.saturate(Random.between(-0.2, 0.2, tile.toString(), 'saturate')),
	);
	const contextMenu = useMapTileContextMenu();

	const onRmb = useCallback<MouseEventHandler<SVGPolygonElement>>(
		(event) => {
			contextMenu.open(event, { tile });
		},
		[contextMenu],
	);

	const [x1, y1] = tile.location.get();
	const points = tile.outlineCoordinates
		.map(([x2, y2]) => `${(x1 + x2) * zoom},${(y1 + y2) * zoom}`)
		.join(' ');

	return <polygon points={points} fill={color.toString()} onContextMenu={onRmb} />;
};
