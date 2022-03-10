import React, { useMemo } from 'react';
import { perspective } from '../constants/perspective';
import { color } from '../styles';
import { TerrainI, TileI } from '../types';
import { DualMeshTileC } from './DualMeshTileC';

export const DualMeshTerrainC: TerrainI['Component'] = ({
	terrain,
	onTileClick,
	onTileContextMenu
}) => {
	const pathElements = useMemo(() => {
		const seen: TileI[] = [];

		return terrain.tiles
			.reduce<[TileI, TileI][]>((connections, origin) => {
				seen.push(origin);
				return origin.isLand()
					? connections.concat(
							terrain
								.getNeighborTiles(origin)
								.filter(target => target.isLand())
								.filter(target => !seen.includes(target))
								.map(target => [origin, target])
					  )
					: connections;
			}, [])
			.map(coords => coords.map(c => perspective.toPixels(c.x, c.y, c.z)))
			.map(([origin, target]) => (
				<line
					key={`${origin}x${target}`}
					x1={origin[0]}
					y1={origin[1]}
					x2={target[0]}
					y2={target[1]}
					stroke={color.terrainStroke.opaquer(-0.6).string()}
					strokeDasharray="3"
				/>
			));
	}, [terrain]);
	const terrainElements = useMemo(
		() =>
			terrain.getTilesInRenderOrder().map(tile => (
				<DualMeshTileC
					key={tile.toString()}
					tile={tile}
					onClick={
						onTileClick
							? event => {
									event.preventDefault();
									event.stopPropagation();
									onTileClick(event, tile);
							  }
							: onTileClick
					}
					onContextMenu={
						onTileContextMenu
							? event => {
									event.preventDefault();
									onTileContextMenu(event, tile);
							  }
							: onTileContextMenu
					}
				/>
			)),
		[terrain, onTileClick, onTileContextMenu]
	);
	return (
		<g className="dual-mesh-terrain">
			<g className="dual-mesh-terrain__tiles">{terrainElements}</g>
			<g className="dual-mesh-terrain__paths">{pathElements}</g>
		</g>
	);
};
