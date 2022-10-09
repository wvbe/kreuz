import { useCallback, useEffect, useRef, useState } from 'react';
import { ThreeController } from '../../rendering/ThreeController.ts';

export function useRenderingController(
	options: ConstructorParameters<typeof ThreeController>[1],
	build: (controller: ThreeController) => () => void,
): { controller: ThreeController | null; onRef: (element: HTMLElement | null) => void } {
	const mounted = useRef<null | ThreeController>(null);
	const [controller, setController] = useState<ThreeController | null>(null);

	useEffect(() => {
		return () => {
			if (!mounted.current) {
				return;
			}
			mounted.current.destructor();
			mounted.current = null;
			setController(mounted.current);
		};
	}, []);

	const onRef = useCallback(
		(element: HTMLElement | null) => {
			if (!element) {
				return;
			}
			if (mounted.current) {
				mounted.current.destructor();
			}
			const three = new ThreeController(element, options);
			three.$destruct.once(build(three));
			three.startAnimationLoop();
			setController(three);
			mounted.current = three;
		},
		[options, build],
	);

	return { controller, onRef };
}
