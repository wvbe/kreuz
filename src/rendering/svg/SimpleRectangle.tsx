import Color from 'color';
import React, { FunctionComponent, useMemo } from 'react';
import { CoordinateArray } from '../../classes/Coordinate';
import { color } from '../../styles';
import { SvgMouseInteractionProps } from '../../types';
import { InGameDistance, perspective } from './perspective';

const BORDER_WIDTH = 0;

function coordsToPixels(coords: CoordinateArray[], borderWidth = BORDER_WIDTH) {
	return coords
		.map(coordinate => perspective.toPixels(...coordinate))
		.map(cc => cc.map(c => c + borderWidth));
}

export const SimpleRectangle: FunctionComponent<
	SvgMouseInteractionProps & {
		width?: number;
		length?: number;
		height?: number;
		strokeLinecap?: 'round' | 'butt' | 'square' | 'inherit' | undefined;
		fill?: Color;
		stroke?: Color | null;
		strokeWidth?: InGameDistance;
		innerStrokeWidth?: InGameDistance;
		innerStroke?: Color | null;
	}
> = ({
	width = 1,
	length = 1,
	height = 1,
	fill = color.terrain,
	strokeLinecap = 'round',
	stroke = null, //fill.darken(0.3).saturate(0.3),
	strokeWidth = 1,
	innerStroke = null, //fill.lighten(0.4).desaturate(0.8),
	innerStrokeWidth = strokeWidth,
	...gProps
}) => {
	const { COORDINATE_CLOSEST_TO_CAMERA, BORDER_NODES, XY_NODES, XZ_NODES, YZ_NODES } =
		useMemo(() => {
			const COORDINATE_CLOSEST_TO_CAMERA = perspective
				.toPixels(width, 0, height)
				.map(c => c + BORDER_WIDTH);

			let BORDER_NODES = coordsToPixels([
				[width, length, 0], // 0
				[width, length, height],
				[0, length, height], // 2
				[0, 0, height],
				[0, 0, 0], // 4
				[width, 0, 0]
			]);

			// facing to the bottom left, aka -y
			let XZ_NODES = coordsToPixels([
				[0, 0, 0],
				[0, 0, height],
				[width, 0, height],
				[width, 0, 0]
			]);

			// facing to the bottom right, aka +x
			let YZ_NODES = coordsToPixels([
				[width, 0, 0],
				[width, length, 0],
				[width, length, height],
				[width, 0, height]
			]);

			// facing top, aka +z
			let XY_NODES = coordsToPixels([
				[0, 0, height],
				[width, 0, height],
				[width, length, height],
				[0, length, height]
			]);

			return { COORDINATE_CLOSEST_TO_CAMERA, BORDER_NODES, XY_NODES, XZ_NODES, YZ_NODES };
		}, [width, length, height]);

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
						points={XZ_NODES.map(c => c.join(',')).join(' ')}
						fill={fill.string()}
						strokeWidth={0}
					/>
					<polygon
						key={'xy'}
						points={XY_NODES.map(c => c.join(',')).join(' ')}
						fill={fill.lighten(0.2).string()}
						strokeWidth={0}
					/>
					<polygon
						key={'yz'}
						points={YZ_NODES.map(c => c.join(',')).join(' ')}
						fill={fill.darken(0.2).string()}
						strokeWidth={0}
					/>
				</>
			)}
			{innerStroke && innerStrokeWidth && (
				<>
					<line
						key={'x-bar'}
						x1={COORDINATE_CLOSEST_TO_CAMERA[0]}
						y1={COORDINATE_CLOSEST_TO_CAMERA[1]}
						x2={BORDER_NODES[3][0]}
						y2={BORDER_NODES[3][1]}
						stroke={innerStrokeCss || undefined}
						strokeWidth={innerStrokeWidth}
						strokeLinecap={strokeLinecap}
					/>
					<line
						key={'y-bar'}
						x1={COORDINATE_CLOSEST_TO_CAMERA[0]}
						y1={COORDINATE_CLOSEST_TO_CAMERA[1]}
						x2={BORDER_NODES[1][0]}
						y2={BORDER_NODES[1][1]}
						stroke={innerStrokeCss || undefined}
						strokeWidth={innerStrokeWidth}
						strokeLinecap={strokeLinecap}
					/>
					<line
						key={'z-bar'}
						x1={COORDINATE_CLOSEST_TO_CAMERA[0]}
						y1={COORDINATE_CLOSEST_TO_CAMERA[1]}
						x2={BORDER_NODES[5][0]}
						y2={BORDER_NODES[5][1]}
						stroke={innerStrokeCss || undefined}
						strokeWidth={innerStrokeWidth}
						strokeLinecap={strokeLinecap}
					/>
				</>
			)}

			{stroke && strokeWidth && (
				<polygon
					key={'outline'}
					points={BORDER_NODES.map(c => c.join(',')).join(' ')}
					stroke={strokeCss || undefined}
					fill={'transparent'}
					strokeWidth={strokeWidth}
					strokeLinecap={strokeLinecap}
				/>
			)}
		</g>
	);
};
