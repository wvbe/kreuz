import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { useEventReducer } from '../hooks/events';
import { useGame } from '../hooks/game';
import { OverlayC } from './threejs/ThreeOverlay';
import { useRenderingController } from './useRenderingController';

const AsLargeAsPossibleContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

const RENDERER_OPTIONS = {
	fieldOfView: 45,
	enableAutoRotate: false,
	enablePan: true,
	enableZoom: true,
	restrictCameraAngle: true
};

export const RendererMain: FunctionComponent = () => {
	const game = useGame();
	const contextMenuState = useEventReducer(
		game.contextMenu.$changed,
		() => game.contextMenu.state,
		[]
	);
	const { controller, onRef } = useRenderingController(
		RENDERER_OPTIONS,
		useCallback(
			controller => {
				controller.addAxisHelper(new Coordinate(-1, -1, -1));
				controller.attachToGame(game);

				return () => {
					// No further cleanup actions required, .attachToGame sets all the appropriate listeners
				};
			},
			[game]
		)
	);

	return (
		<AsLargeAsPossibleContainer className="renderer-three" ref={onRef}>
			{controller && contextMenuState && (
				<OverlayC three={controller} position={contextMenuState.location}>
					{contextMenuState.contents}
				</OverlayC>
			)}
		</AsLargeAsPossibleContainer>
	);
};
