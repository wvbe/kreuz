import React, { FunctionComponent } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { PERSPECTIVE } from '../space/PERSPECTIVE';
import { SvgMouseInteractionProps } from '../types';
import { DualMeshTerrain, DualMeshTile } from './DualMeshTerrain';
import { GenericTerrainComponentI } from './GenericTerrain';

export const DualMeshTileComponent: FunctionComponent<
	SvgMouseInteractionProps & {
		tile: DualMeshTile;
		nodes: Coordinate[];
	}
> = ({ tile, nodes, ...svgProps }) => {
	const center = PERSPECTIVE.toPixels(tile.x, tile.y, tile.z);
	return (
		<>
			<polyline
				fill={tile.isOnBoundary ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
				stroke={tile.isOnBoundary ? undefined : 'black'}
				points={nodes.map(n => PERSPECTIVE.toPixels(n.x, n.y, n.z).join(',')).join(' ')}
				{...svgProps}
			/>
			<circle
				cx={center[0]}
				cy={center[1]}
				r="9"
				fill="transparent"
				stroke={tile.isOnBoundary ? 'red' : 'blue'}
			/>
		</>
	);
};

export const DualMeshTerrainComponent: GenericTerrainComponentI<DualMeshTerrain, DualMeshTile> = ({
	terrain,
	onTileClick,
	onTileContextMenu
}) => (
	<g className="dual-mesh-terrain">
		{terrain.getTilesInRenderOrder().map(tile => (
			<DualMeshTileComponent
				key={tile.toString()}
				nodes={tile.outlinePoints || []}
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
		))}
	</g>
);
