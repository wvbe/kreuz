import panzoom, { PanZoom } from 'panzoom';
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FunctionComponent,
	type ReactNode,
} from 'react';

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

const panzoomControlsContext = createContext<{
	isPaused: boolean;
	setIsPaused: (isPaused: boolean) => void;
}>({
	isPaused: true,
	setIsPaused: () => {},
});
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
	const [isPaused, setIsPaused] = useState(true);
	const elementRef = useRef<HTMLDivElement | null>(null);
	const panzoomRef = useRef<PanZoom | null>(null);

	useEffect(() => {
		if (!elementRef.current) {
			return;
		}
		if (panzoomRef.current) {
			return;
		}

		panzoomRef.current = panzoom(elementRef.current, {
			bounds: true,
			boundsPadding: 0.1,
			maxZoom: 2,
			minZoom: 0.5,
		});
		return () => {
			panzoomRef.current?.dispose();
			panzoomRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!panzoomRef.current) {
			return;
		}
		if (isPaused) {
			panzoomRef.current.pause();
		} else {
			panzoomRef.current.resume();
		}
	}, [isPaused]);

	const panzoomControls = useMemo(() => ({ isPaused, setIsPaused }), [isPaused]);

	return (
		<panzoomControlsContext.Provider value={panzoomControls}>
			<div style={outerStyle}>
				<div ref={(el) => (elementRef.current = el)} style={innerStyle}>
					{children}
				</div>
			</div>
		</panzoomControlsContext.Provider>
	);
};

export function usePanZoomControls(): {
	isPaused: boolean;
	setIsPaused: (isPaused: boolean) => void;
} {
	const panzoomControls = useContext(panzoomControlsContext);
	if (!panzoomControls) {
		throw new Error('PanZoomControlsContext not found');
	}
	return panzoomControls;
}
