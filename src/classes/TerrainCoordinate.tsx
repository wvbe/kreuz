import { FunctionComponent, useState } from 'react';
import { Coordinate, CoordinateLike } from './Coordinate';
import { Anchor } from '../space/Anchor';
import { MonochromeBox } from '../space/MonochromeBox';
import { MonochromeTile } from '../space/MonochromeTile';
import { Terrain } from './Terrain';
import { color } from '../styles';

type OnTerrainClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class TerrainCoordinate extends Coordinate {
	terrain?: Terrain;

	equals(coord: CoordinateLike) {
		return this === coord || (coord && this.x === coord.x && this.y === coord.y);
	}
	static clone(coord: CoordinateLike) {
		return new TerrainCoordinate(coord.x, coord.y, coord.z);
	}

	canWalkHere() {
		return this.z > 0;
	}
}

/**
 * A component that automatically transitions the entity component as per its move instructions
 */
export const TerrainCoordinateComponent: FunctionComponent<{
	terrainCoordinate: TerrainCoordinate;
	onClick?: OnTerrainClick;
}> = ({ terrainCoordinate, onClick }) => {
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
					onClick={onClick}
				/>
			) : (
				<MonochromeTile
					fill={(isHovered ? color.highlightedTerrain : color.terrain).opaquer(-0.5)}
					stroke={isHovered ? color.white : undefined}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					onClick={onClick}
				/>
			)}
		</Anchor>
	);
};
