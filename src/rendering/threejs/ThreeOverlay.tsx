import { FunctionComponent, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CoordinateI } from '../../types';
import { ThreeController } from './ThreeController';

/**
 * Uses a React portal and ThreeJS projection to render children onto a specific location in the
 * ThreeJS canvas. The element gets stuck onto that spot and plays nice with moving the camera
 * around and resizing the canvas.
 */
export const OverlayC: FunctionComponent<{ three: ThreeController; position: CoordinateI }> = ({
	three,
	position,
	children
}) => {
	const container = useMemo(() => window.document.createElement('div'), []);
	useEffect(() => three.openHtmlOverlay(position, container), [three, container, position]);

	// https://reactjs.org/docs/portals.html
	return createPortal(children, container);
};
