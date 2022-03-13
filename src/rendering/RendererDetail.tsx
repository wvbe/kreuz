import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import Logger from '../classes/Logger';
import { ThreeController } from './threejs/ThreeController';

const FullScreenContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

export const RendererDetail: FunctionComponent<{ build: (controller: ThreeController) => void }> =
	({ build }) => {
		const mounted = useRef(false);
		const [controller, setController] = useState<ThreeController | null>(null);
		useEffect(() => () => controller?.stopAnimationLoop(), [controller]);
		const mountController = useCallback(
			(element: HTMLElement | null) => {
				if (!element || mounted.current) {
					return;
				}
				mounted.current = true;

				const three = new ThreeController(element, {
					fieldOfView: 45,
					enableAutoRotate: true,
					enablePan: false,
					enableZoom: true,
					restrictCameraAngle: false
				});
				build(three);
				three.startAnimationLoop();
				setController(three);

				return () => {
					three.stopAnimationLoop();
				};
			},
			[build]
		);

		return (
			<FullScreenContainer
				className="renderer-three"
				ref={mountController}
			></FullScreenContainer>
		);
	};
