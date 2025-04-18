import panzoom from 'panzoom';
import React, { useEffect, useRef, type FunctionComponent, type ReactNode } from 'react';

const outerStyle: React.CSSProperties = {
	position: 'absolute',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh',
	zIndex: 1,
	overflow: 'hidden',
};
const innerStyle = { width: '100%', height: '100%' };

/**
 * A component that wraps its children in a pannable and zoomable viewport.
 * Uses the panzoom library to enable:
 * - Panning via mouse drag or touch
 * - Zooming via mouse wheel or pinch gesture
 * - Bounded movement with 10% padding
 * - Zoom limits between 0.5x and 2x
 *
 * The viewport takes up the full window size and prevents content from overflowing.
 */
export const PanZoomable: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
	const ref = useRef<Element | null>(null);
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const i = panzoom(ref.current, {
			bounds: true,
			boundsPadding: 0.1,
			maxZoom: 2,
			minZoom: 0.5,
		});
		return () => {
			i.dispose();
		};
	});
	return (
		<div style={outerStyle}>
			<div ref={(el) => (ref.current = el)} style={innerStyle}>
				{children}
			</div>
		</div>
	);
};
