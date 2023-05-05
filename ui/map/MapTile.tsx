import { type TileI, Random } from '@lib';
import React, { type FunctionComponent, useMemo } from 'react';
import Color from 'color';

// <palette>
// 	<color name='dry-grass-patches-1' rgb='A09E55' r='160' g='158' b='84' />
// 	<color name='dry-grass-patches-2' rgb='8F8A49' r='142' g='137' b='73' />
// 	<color name='dry-grass-patches-3' rgb='6D733D' r='109' g='114' b='61' />
// 	<color name='dry-grass-patches-4' rgb='828034' r='130' g='128' b='52' />
// 	<color name='dry-grass-patches-5' rgb='AE9F68' r='174' g='158' b='103' />
// </palette>

const greens = ['#A09E55', '#8F8A49', '#6D733D', '#828034', '#AE9F68'];

const baseGreen = Color('#8F8A49');
export const MapTile: FunctionComponent<{ zoom: number; tile: TileI }> = ({ tile, zoom }) => {
	const green = useMemo(
		() =>
			baseGreen
				.lighten(Random.between(-0.05, 0.05, tile.toString(), 'lighten'))
				.saturate(Random.between(-0.2, 0.2, tile.toString(), 'saturate')),
		[],
	);
	if (!tile.isLand()) {
		return null;
	}

	const points = tile
		.getOutlineCoordinates()
		.map((coord) => `${(tile.x + coord.x) * zoom},${(tile.y + coord.y) * zoom}`)
		.join(' ');

	return <polygon points={points} fill={green} />;
};
