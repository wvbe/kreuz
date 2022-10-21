import { type FunctionComponent, type ReactNode, useCallback, useEffect, useRef } from 'react';
import panzoom from 'panzoom';

export const PanZoom: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
	const ref = useRef<Element | null>(null);
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		console.log('Apply pan/zoom');
		const i = panzoom(ref.current, {
			bounds: true,
			boundsPadding: 0.1,
			maxZoom: 2,
			minZoom: 0.5,
		});
		return () => {
			console.log('Destroy pan/zoom');
			i.dispose();
		};
	});
	return (
		<div ref={(el) => (ref.current = el)} className="viewport">
			{children}
		</div>
	);
};
