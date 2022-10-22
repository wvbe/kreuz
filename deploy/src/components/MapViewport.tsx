import { type FunctionComponent, type ReactNode } from 'react';
import { PanZoom } from './atoms/PanZoom.tsx';

export const MapViewport: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
	return <PanZoom>{children}</PanZoom>;
};
