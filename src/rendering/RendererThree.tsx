import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import Logger from '../classes/Logger';
import { activePalette } from '../constants/palettes';
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

export const RendererThree: FunctionComponent = () => {
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
				backgroundColor: activePalette.dark,
				fieldOfView: 45
			});
			three.attachToGame(game);
			three.startAnimationLoop();
			Logger.groupEnd();

			// if (onEntityClick) {
			// 	three.$dispose.once(
			// 		three.$clickEntity.on((event, entity) => {
			// 			event.preventDefault();
			// 			onEntityClick(entity);
			// 			game.contextMenu.close();
			// 		})
			// 	);
			// }
			// three.$dispose.once(
			// 	three.$click.on(() => {
			// 		game.contextMenu.close();
			// 	})
			// );

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
