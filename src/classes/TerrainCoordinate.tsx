import { FunctionComponent, useState } from 'react';
import { Coordinate, CoordinateLike } from './Coordinate';
import { Anchor } from '../space/Anchor';
import { MonochromeBox } from '../space/MonochromeBox';
import { MonochromeTile } from '../space/MonochromeTile';
import { Terrain } from './Terrain';
import { color } from '../styles';
import { SvgMouseInteractionProps } from '../types';

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class TerrainCoordinate extends Coordinate {
	terrain?: Terrain;

	equals(coord: CoordinateLike) {
		return this === coord || (coord && this.x === coord.x && this.y === coord.y);
	}
	static clone(coord: CoordinateLike | TerrainCoordinate) {
		const coord2 = new TerrainCoordinate(coord.x, coord.y, coord.z);
		coord2.terrain = (coord as TerrainCoordinate).terrain;
		return coord2;
	}

	isLand() {
		return this.z > 0;
	}
	// For debugging purposes only, may change without notice or tests
	toString() {
		return '(' + [this.x, this.y].join(',') + ')';
	}
}

/**
 * A component that automatically transitions the entity component as per its move instructions
 */
export const TerrainCoordinateComponent: FunctionComponent<
	SvgMouseInteractionProps & {
		terrainCoordinate: TerrainCoordinate;
	}
> = ({ terrainCoordinate, ...svgMouseInteractionProps }) => {
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
