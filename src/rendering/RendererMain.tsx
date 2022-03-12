import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import { Coordinate } from '../classes/Coordinate';
import Logger from '../classes/Logger';
import { useEventReducer } from '../hooks/events';
import { useGame } from '../hooks/game';
import { ThreeController } from './threejs/ThreeController';
import { OverlayC } from './threejs/ThreeOverlay';

const FullScreenContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

export const RendererMain: FunctionComponent = () => {
	const game = useGame();
	const mounted = useRef(false);
	const [controller, setController] = useState<ThreeController | null>(null);
	const contextMenuState = useEventReducer(
		game.contextMenu.$changed,
		() => game.contextMenu.state,
		[]
	);
	const mountController = useCallback(
		(element: HTMLElement | null) => {
			if (!element || mounted.current) {
				return;
			}
			mounted.current = true;

			const three = new ThreeController(element, {
				fieldOfView: 45,
				enableAutoRotate: false,
				enablePan: true,
				enableZoom: true,
				restrictCameraAngle: true
			});
			three.addAxisHelper(new Coordinate(-1, -1, -1));
			three.attachToGame(game);
			three.startAnimationLoop();
			Logger.groupEnd();

			setController(three);

			return () => {
				three.dispose();
			};
		},
		[game]
	);

	return (
		<FullScreenContainer className="renderer-three" ref={mountController}>
			{controller && contextMenuState && (
				<OverlayC three={controller} position={contextMenuState.location}>
					{contextMenuState.contents}
				</OverlayC>
			)}
		</FullScreenContainer>
	);
};
