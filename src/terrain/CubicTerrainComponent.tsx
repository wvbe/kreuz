import { FunctionComponent, useState } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { Anchor } from '../space/Anchor';
import { MonochromeBox } from '../space/MonochromeBox';
import { MonochromeTile } from '../space/MonochromeTile';
import { color } from '../styles';
import { SvgMouseInteractionProps } from '../types';
import { CubicTerrain, CubicTile } from './CubicTerrain';
import { GenericTerrainComponentI, GenericTile } from './GenericTerrain';

/**
 * A component that automatically transitions the entity component as per its move instructions
 */
const CubicTileComponent: FunctionComponent<
	SvgMouseInteractionProps & {
		tile: GenericTile;
	}
> = ({ tile: terrainCoordinate, ...svgMouseInteractionProps }) => {
	const [isHovered, setIsHovered] = useState(false);
	const translated = Coordinate.clone(terrainCoordinate).transform(
		-0.5,
		-0.5,
		terrainCoordinate.z < 0 ? -terrainCoordinate.z - 0.5 : -1
	);
	return (
		<Anchor key={translated.toString()} x={translated.x} y={translated.y} z={translated.z}>
			{terrainCoordinate.z > 0 ? (
				<MonochromeBox
					fill={isHovered ? color.highlightedTerrain : color.terrain}
					stroke={isHovered ? color.white : undefined}
					innerStroke={
						isHovered ? color.highlightedTerrain.mix(color.white, 0.6) : undefined
					}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					{...svgMouseInteractionProps}
				/>
			) : (
				<MonochromeTile
					fill={(isHovered ? color.highlightedTerrain : color.terrain).opaquer(-0.5)}
					stroke={isHovered ? color.white : undefined}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					{...svgMouseInteractionProps}
				/>
			)}
		</Anchor>
	);
};

export const CubicTerrainComponent: GenericTerrainComponentI<CubicTerrain, CubicTile> = ({
	terrain,
	onTileClick,
	onTileContextMenu
}) => (
	<g className="cubic-terrain">
		{terrain.getTilesInRenderOrder().map(tile => (
			<CubicTileComponent
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
		))}
	</g>
);
