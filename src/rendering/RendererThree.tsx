import styled from '@emotion/styled';
import React, {
	ComponentType,
	FunctionComponent,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';
import Logger from '../classes/Logger';
import { activePalette } from '../constants/palettes';
import { useEventReducer } from '../hooks/events';
import { useGame } from '../hooks/game';
import { DualMeshTerrainC } from '../terrain/DualMeshTerrainC';
import { EntityPersonI, TileI } from '../types';
import { ThreeController } from './threejs/ThreeController';
import { OverlayC } from './threejs/ThreeOverlay';
const FullScreenContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

export const RendererThree: FunctionComponent<{
	onTileClick: (typeof DualMeshTerrainC extends ComponentType<infer P>
		? P
		: never)['onTileClick'];
	onTileContextMenu: (typeof DualMeshTerrainC extends ComponentType<infer P>
		? P
		: never)['onTileContextMenu'];
	onEntityClick: (entity: EntityPersonI) => void;
	center: TileI;
}> = ({ onTileClick, onEntityClick, center }) => {
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

			Logger.group('Start ThreeJS');
			const three = new ThreeController(element, {
				backgroundColor: activePalette.dark,
				fieldOfView: 45
			});
			three.createGamePopulation(game);
			three.startAnimationLoop();
			Logger.groupEnd();

			const destroyers: (undefined | (() => void))[] = [
				onEntityClick &&
					three.$clickEntity.on((event, entity) => {
						event.preventDefault();
						onEntityClick(entity);
						game.contextMenu.close();
					}),
				onTileClick &&
					three.$clickTile.on((event, tile) => {
						event.preventDefault();
						onTileClick(tile);
					}),
				three.$click.on(() => {
					game.contextMenu.close();
				})
			];

			setController(three);
			return () => destroyers.forEach(d => d && d());
		},
		[game, onTileClick, onEntityClick]
	);

	useEffect(() => {
		controller?.setCameraFocus(center);
	}, [controller, center]);

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
