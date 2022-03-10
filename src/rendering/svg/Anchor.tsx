import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React, { FunctionComponent, useMemo } from 'react';
import { CoordinateArray } from '../../classes/Coordinate';
import { CoordinateI, SvgMouseInteractionProps } from '../../types';
import { LinePath } from './LinePath';
import { InGameDistance, perspective } from '../../constants/perspective';

const Crosshair: FunctionComponent<{ size: InGameDistance }> = ({ size = 4 }) => {
	const lines: CoordinateArray[][] = [
		[
			// over the x axis
			[-1 * size, 0, 0],
			[size, 0, 0]
		],
		[
			// over the y axis
			[0, -1 * size, 0],
			[0, size, 0]
		],
		[
			// over the z axis
			[0, 0, -1 * size],
			[0, 0, size]
		]
	];

	return (
		<>
			{lines.map((points, i) => (
				<LinePath key={i} path={points} stroke={'rgba(0,0,0)'} strokeWidth={0.5} />
			))}
		</>
	);
};

export const Anchor: FunctionComponent<
	SvgMouseInteractionProps & {
		crosshairSize?: InGameDistance;
	} & Partial<CoordinateI>
> = ({ x = 0, y = 0, z = 0, children, crosshairSize = 0 }) => {
	const pixels = useMemo(() => perspective.toPixels(x, y, z), [x, y, z]);

	return (
		<svg x={pixels[0]} y={pixels[1]} overflow={'visible'}>
			{crosshairSize ? <Crosshair size={crosshairSize} /> : null}
			{children}
		</svg>
	);
};

export const MovingAnchor: FunctionComponent<
	SvgMouseInteractionProps & {
		moveTo: CoordinateI;
		moveSpeed: number;
		onRest?: () => void;
		crosshairSize?: InGameDistance;
	}
> = ({ moveTo, moveSpeed, onRest, children, crosshairSize = 0, onClick }) => {
	const [dx, dy] = useMemo(() => perspective.toPixels(moveTo.x, moveTo.y, moveTo.z), [moveTo]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const [ix, iy] = useMemo(() => [dx, dy], []);

	// if (isNaN(dx) || isNaN(dy)) {
	// 	debugger;
	// }
	const loc = useSpring({
		to: {
			x: dx,
			y: dy
		},
		config: {
			duration: moveSpeed
		},
		from: {
			x: ix,
			y: iy
		},
		onRest
	});

	// @TODO reuse <Anchor>
	return (
		<animated.svg x={loc.x} y={loc.y} overflow={'visible'} onClick={onClick}>
			{crosshairSize ? <Crosshair size={crosshairSize} /> : null}
			{children}
		</animated.svg>
	);
};
