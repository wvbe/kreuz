import styled from '@emotion/styled';
import React, { FunctionComponent, ReactElement, useMemo } from 'react';
import { CoordinateLike } from '../classes/Coordinate';
import { InGameDistance, PERSPECTIVE } from './PERSPECTIVE';

// The pythagoras distance (1/sqrt(2)) with a little tweaking for better looks
const PIXEL_FRIENDLY_PYTHAGORAS = 1 / Math.pow(2, 1 / 2); //0.8;

function mathRoundMaybe(n: number) {
	// For debugging only. Adjust to taste.

	return Math.round(n);
	// return n;
}

// Force the type to AnimatedComponent to avoid a weird TS inference bug
//
export const AbsolutelyPositionedContainer = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	width: 0;
	height: 0;
	transition: transform 5s;
	> * {
		position: absolute;
		top: 0;
		left: 0;
	}
`;

type ViewportComponentProps = {
	zoom?: number;
	center?: CoordinateLike;
	overlay?: ReactElement;
};

export const Viewport: FunctionComponent<ViewportComponentProps> = ({
	overlay,
	center = { x: 0, y: 0, z: 0 },
	zoom = 1,
	children
}) => {
	const [translateX, translateY] = useMemo(
		() =>
			PERSPECTIVE.toPixels(center.x, center.y, center.z).map(
				(n, i) => mathRoundMaybe(-n) + (i ? 0 : 0.5)
			),
		[center]
	);

	const springStyles =
		//useSpring({
		// 	config: config.molasses,
		// 	to:
		{
			transform: `translate(
				${translateX * zoom}px,
				${translateY * zoom}px
			)`
		};
	// });

	return (
		<AbsolutelyPositionedContainer style={springStyles}>
			<ViewportSvgContainer zoom={zoom} children={children} />
			{overlay}
		</AbsolutelyPositionedContainer>
	);
};

export const ViewportSvgContainer: FunctionComponent<
	{
		zoom?: number;
	} & React.SVGProps<SVGSVGElement>
> = ({ zoom = 1, ...rest }) => (
	<svg
		width="1px"
		height="1px"
		overflow="visible"
		shapeRendering="geometricPrecision"
		viewBox={[0, 0, 1 / zoom, 1 / zoom].join(' ')}
		{...rest}
	/>
);

const NoAxis = styled.div<{ zoom?: number }>`
	--scale-val: ${({ zoom = 1 }) => zoom};

	position: absolute;
	transform-origin: top left;
	transform: scale(var(--scale-val));
`;

const YAxis = styled(NoAxis)`
	transform: skewY(-${PERSPECTIVE.degrees}deg)
		scale(calc(${PIXEL_FRIENDLY_PYTHAGORAS} * var(--scale-val)), var(--scale-val));
`;

const ZAxis = styled(NoAxis)`
	transform: rotate(-${PERSPECTIVE.degrees}deg) skewX(${PERSPECTIVE.degrees}deg)
		scale(
			calc(${Math.sqrt(PIXEL_FRIENDLY_PYTHAGORAS)} * var(--scale-val)),
			calc(${PIXEL_FRIENDLY_PYTHAGORAS} * var(--scale-val))
		);
`;

const XAxis = styled(NoAxis)`
	transform: skewY(${PERSPECTIVE.degrees}deg)
		scale(calc(${PIXEL_FRIENDLY_PYTHAGORAS} * var(--scale-val)), var(--scale-val));
`;

export const ViewportHtmlContainer: FunctionComponent<{
	axis?: 'x' | 'y' | 'z';
	width: InGameDistance;
	height: InGameDistance;
	zoom?: number;
	location: CoordinateLike;
}> = ({ location, zoom = 1, axis, width, height, children }) => {
	const { x, y, z } = location,
		// @TODO use css variable to zoom instead of JS
		[left, top] = PERSPECTIVE.toPixels(x, y, z).map(n => mathRoundMaybe(n * zoom));
	// @TODO use css variable to zoom instead of JS
	const [pixelWidth] = PERSPECTIVE.toPixels(0, width, height).map(n => mathRoundMaybe(n * zoom));
	const Axis = axis === 'y' ? YAxis : axis === 'x' ? XAxis : axis === 'z' ? ZAxis : NoAxis;
	return (
		<Axis
			zoom={zoom}
			style={{
				left: mathRoundMaybe(left),
				top: mathRoundMaybe(top),
				width:
					mathRoundMaybe(axis ? pixelWidth / PIXEL_FRIENDLY_PYTHAGORAS : pixelWidth) +
					'px',
				height:
					Math.abs(
						(height * PERSPECTIVE.tileSize) /
							(axis === 'z' ? PIXEL_FRIENDLY_PYTHAGORAS : 1)
					) + 'px'
			}}
		>
			{children}
		</Axis>
	);
};
