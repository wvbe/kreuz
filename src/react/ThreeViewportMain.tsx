import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback } from 'react';
import { Coordinate } from '../classes/Coordinate.ts';
import { useEventedValue } from './hooks/events.ts';
import { useGame } from './hooks/game.ts';
import { ThreeHtmlOverlayPortal } from './ThreeHtmlOverlayPortal.tsx';
import { useRenderingController } from './hooks/three.ts';

const AsLargeAsPossibleContainer = styled.section`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

const RENDERER_OPTIONS = {
	enableAutoRotate: false,
	enablePan: true,
	enableZoom: true,
	fieldOfView: 45,
	pixelRatio: window.devicePixelRatio || 1,
	restrictCameraAngle: true,
};

export const RendererMain: FunctionComponent = () => {
	const game = useGame();
	const contextMenuState = useEventedValue(game.$$contextMenu);
	const { controller, onRef } = useRenderingController(
		RENDERER_OPTIONS,
		useCallback(
			(controller) => {
				controller.addAxisHelper(new Coordinate(-1, -1, -1));
				controller.attachToGame(game);

				return () => {
					controller.detachFromGame();
				};
			},
			[game],
		),
	);

	return (
		<AsLargeAsPossibleContainer className="renderer-three" ref={onRef}>
			{controller && contextMenuState && (
				<ThreeHtmlOverlayPortal three={controller} position={contextMenuState.location}>
					{contextMenuState.contents}
				</ThreeHtmlOverlayPortal>
			)}
		</AsLargeAsPossibleContainer>
	);
};
