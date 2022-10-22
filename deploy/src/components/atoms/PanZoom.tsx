import panzoom from 'panzoom';
import { useEffect, useRef, type FunctionComponent, type ReactNode } from 'react';

export const PanZoom: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
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
		<div ref={(el) => (ref.current = el)} className="viewport">
			{children}
		</div>
	);
};
