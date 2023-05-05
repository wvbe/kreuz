import React, { type FunctionComponent, type ReactNode } from 'react';
import { PanZoom } from './PanZoom.tsx';

export const MapViewport: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
	return <PanZoom>{children}</PanZoom>;
};
