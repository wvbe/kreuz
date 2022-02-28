import Color from 'color';
import React, { FunctionComponent } from 'react';
import { CoordinateArray } from '../classes/Coordinate';
import { color } from '../styles';

import { PERSPECTIVE } from './PERSPECTIVE';

const BORDER_WIDTH = 1;
const BORDER_NODES: CoordinateArray[] = [
	[1, 0, 0],
	[1, 1, 0],
	[0, 1, 0],
	[0, 0, 0]
];

let spatialCoordinates = BORDER_NODES.map(coordinate => PERSPECTIVE.toPixels(...coordinate)).map(
	cc => cc.map(c => c + BORDER_WIDTH)
);

export const SimpleSquare: FunctionComponent<
	Omit<React.SVGProps<SVGPolygonElement>, 'fill' | 'stroke'> & {
		zoom?: number;
		fill?: Color;
		stroke?: Color;
	}
> = ({
	fill = color.terrain,
	stroke = fill.darken(0.3).saturate(0.3),
	strokeWidth = BORDER_WIDTH,
	zoom = 1,
	...rest
}) => {
	return (
		<polygon
			points={spatialCoordinates.map(c => c.map(c => c * zoom).join(',')).join(' ')}
			stroke={stroke.string()}
			fill={fill.string()}
			strokeWidth={strokeWidth}
			{...rest}
		/>
	);
};
