import { useCallback, useEffect, useRef, useState } from 'react';
import { ThreeController } from './threejs/ThreeController';

export function useRenderingController(
	options: ConstructorParameters<typeof ThreeController>[1],
	build: (controller: ThreeController) => () => void
): { controller: ThreeController | null; onRef: (element: HTMLElement | null) => void } {
	const mounted = useRef<null | ThreeController>(null);
	const [controller, setController] = useState<ThreeController | null>(null);

	useEffect(() => {
		return () => {
			if (!mounted.current) {
				return;
			}
			mounted.current.stopAnimationLoop();
			mounted.current = null;
			setController(mounted.current);
		};
	}, []);

	const onRef = useCallback(
		(element: HTMLElement | null) => {
			if (!element) {
				return;
			}
			const three = mounted.current ? mounted.current : new ThreeController(element, options);
			if (mounted.current) {
				mounted.current.stopAnimationLoop();
			}
			three.$stop.once(build(three));
			three.startAnimationLoop();
			setController(three);
			mounted.current = three;
		},
		[options, build]
	);

	return { controller, onRef };
}
