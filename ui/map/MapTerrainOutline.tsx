import { type CoordinateI, type Terrain } from '@lib';
import React, { FunctionComponent, useMemo } from 'react';

const MARGIN = 25;

export const MapTerrainOutline: FunctionComponent<{
	terrain: Terrain;
}> = ({ terrain }) => {
	const zoom = 32;

	const edges = useMemo(
		() =>
			terrain.tiles
				.filter((tile) => !tile.isLand() && tile.isAdjacentToLand())
				.map((tile) => {
					const neighborPoints = terrain
						.getNeighborTiles(tile)
						.filter((neighbor) => neighbor.isLand())
						.reduce(
							(pts, neighbor) =>
								pts.concat(
									neighbor.getOutlineCoordinates().map((c) => c.clone().transform(neighbor)),
								),
							[] as CoordinateI[],
						);
					const points = tile
						.getOutlineCoordinates()
						.map((coord, index, all) => ({
							index,
							last: index === all.length - 1,
							coord: coord.clone().transform(tile),
						}))
						.filter((result) =>
							neighborPoints.some(
								(neighbourCoord) =>
									neighbourCoord.x === result.coord.x && neighbourCoord.y === result.coord.y,
							),
						);

					const lines: CoordinateI[][] = [];
					if (!points.length) {
						return lines;
					}

					let index = 0;
					points.forEach((point, _index) => {
						if (!lines.length || point.index !== index) {
							index = point.index;
							lines.push([]);
						}
						const line = lines[lines.length - 1];
						line.push(point.coord);
						index++;
					});
					if (points[0].index === 0 && points[points.length - 1].last) {
						lines[lines.length - 1].push(points[0].coord);
					}
					return lines;
				}, [] as CoordinateI[][])
				.map((lines) => (
					<g>
						{lines.map((points) => (
							<polyline
								points={points.map((coord) => `${coord.x * zoom},${coord.y * zoom}`).join(' ')}
								stroke={'black'}
								strokeWidth={5}
								fill="none"
							/>
						))}
					</g>
				)),
		[],
	);

	return <>{edges}</>;
};
