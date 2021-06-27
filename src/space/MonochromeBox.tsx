import Color from 'color';
import React, { FunctionComponent } from 'react';
import { CoordinateArray } from '../classes/Coordinate';
import { color } from '../styles';
import { SvgMouseInteractionProps } from '../types';
import { InGameDistance, PERSPECTIVE } from './PERSPECTIVE';

const BORDER_WIDTH = 0;

function coordsToPixels(coords: CoordinateArray[], borderWidth = BORDER_WIDTH) {
	return coords
		.map(coordinate => PERSPECTIVE.toPixels(...coordinate))
		.map(cc => cc.map(c => c + borderWidth));
}

const COORDINATE_CLOSEST_TO_CAMERA = PERSPECTIVE.toPixels(1, 0, 1).map(c => c + BORDER_WIDTH);

let BORDER_NODES = coordsToPixels([
	[1, 1, 0], // 0
	[1, 1, 1],
	[0, 1, 1], // 2
	[0, 0, 1],
	[0, 0, 0], // 4
	[1, 0, 0]
]);

// facing to the bottom left, aka -y
let XZ_NODES = coordsToPixels([
	[0, 0, 0],
	[0, 0, 1],
	[1, 0, 1],
	[1, 0, 0]
]);

// facing to the bottom right, aka +x
let YZ_NODES = coordsToPixels([
	[1, 0, 0],
	[1, 1, 0],
	[1, 1, 1],
	[1, 0, 1]
]);

// facing top, aka +z
let XY_NODES = coordsToPixels([
	[0, 0, 1],
	[1, 0, 1],
	[1, 1, 1],
	[0, 1, 1]
]);

export const MonochromeBox: FunctionComponent<
	SvgMouseInteractionProps & {
		size?: number;
		strokeLinecap?: 'round' | 'butt' | 'square' | 'inherit' | undefined;
		fill?: Color;
		stroke?: Color;
		strokeWidth?: InGameDistance;
		innerStrokeWidth?: InGameDistance;
		innerStroke?: Color;
	}
> = ({
	size = 1,
	fill = color.terrain,
	strokeLinecap = 'round',
	stroke = fill.darken(0.3).saturate(0.3),
	strokeWidth = 1,
	innerStroke = fill.lighten(0.4).desaturate(0.8),
	innerStrokeWidth = strokeWidth,
	...gProps
}) => {
	const innerStrokeCss = innerStroke && innerStroke.string();
	const strokeCss = stroke && stroke.string();

	const style: Record<string, string> = {};
	if (gProps.onClick || gProps.onContextMenu) {
		style.cursor = 'pointer';
	}

	return (
		<g {...gProps} style={style}>
			{fill && (
				<>
					<polygon
						key={'xz'}
						points={XZ_NODES.map(c => c.map(cc => cc * size).join(',')).join(' ')}
						fill={fill.string()}
						strokeWidth={0}
					/>
					<polygon
						key={'xy'}
						points={XY_NODES.map(c => c.map(cc => cc * size).join(',')).join(' ')}
						fill={fill.lighten(0.2).string()}
						strokeWidth={0}
					/>
					<polygon
						key={'yz'}
						points={YZ_NODES.map(c => c.map(cc => cc * size).join(',')).join(' ')}
						fill={fill.darken(0.2).string()}
						strokeWidth={0}
					/>
				</>
			)}
			{innerStroke && (
				<>
					<line
						key={'x-bar'}
						x1={COORDINATE_CLOSEST_TO_CAMERA[0] * size}
						y1={COORDINATE_CLOSEST_TO_CAMERA[1] * size}
						x2={BORDER_NODES[3][0] * size}
						y2={BORDER_NODES[3][1] * size}
						stroke={innerStrokeCss}
						strokeWidth={innerStrokeWidth}
						strokeLinecap={strokeLinecap}
					/>
					<line
						key={'y-bar'}
						x1={COORDINATE_CLOSEST_TO_CAMERA[0] * size}
						y1={COORDINATE_CLOSEST_TO_CAMERA[1] * size}
						x2={BORDER_NODES[1][0] * size}
						y2={BORDER_NODES[1][1] * size}
						stroke={innerStrokeCss}
						strokeWidth={innerStrokeWidth}
						strokeLinecap={strokeLinecap}
					/>
					<line
						key={'z-bar'}
						x1={COORDINATE_CLOSEST_TO_CAMERA[0] * size}
						y1={COORDINATE_CLOSEST_TO_CAMERA[1] * size}
						x2={BORDER_NODES[5][0] * size}
						y2={BORDER_NODES[5][1] * size}
						stroke={innerStrokeCss}
						strokeWidth={innerStrokeWidth}
						strokeLinecap={strokeLinecap}
					/>
				</>
			)}

			<polygon
				key={'outline'}
				points={BORDER_NODES.map(c => c.map(cc => cc * size).join(',')).join(' ')}
				stroke={strokeCss}
				fill={'transparent'}
				strokeWidth={strokeWidth}
				strokeLinecap={strokeLinecap}
			/>
		</g>
	);
};
