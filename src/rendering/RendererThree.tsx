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
import { terrainColors } from '../constants/palettes';
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
	onEntityClick: (event: unknown, entity: EntityPersonI) => void;
	center: TileI;
}> = ({ onTileClick, center }) => {
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
				backgroundColor: terrainColors.dark,
				fieldOfView: 45
			});
			three.initForGame(game);
			three.startAnimationLoop();
			Logger.groupEnd();

			const destroyers: (() => void)[] = [
				three.$click.on(intersections => {
					if (!onTileClick) {
						return;
					}
					const tiles = intersections
						.filter(intersection => intersection.object.type === 'Mesh')
						.map(intersection =>
							three.tilesByMesh.get(intersection.object as THREE.Mesh)
						)
						.filter((tile): tile is TileI => Boolean(tile));
					if (tiles.length !== 1) {
						game.contextMenu.close();
					} else {
						onTileClick(tiles[0]);
					}
				})
			];

			setController(three);
			return () => destroyers.forEach(d => d());
		},
		[game, onTileClick]
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
