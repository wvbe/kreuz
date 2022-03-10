import React, { ComponentType, FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { PersonEntity } from '../entities/PersonEntity';
import { PersonEntityC } from '../entities/PersonEntityC';
import { useEventReducer } from '../hooks/events';
import { useGame } from '../hooks/game';
import { DualMeshTerrainC } from '../terrain/DualMeshTerrainC';
import { EntityPersonI, TileI } from '../types';
import { Viewport, ViewportHtmlContainer } from './svg/Viewport';

const ContextMenuContainer: FunctionComponent<{ zoom?: number }> = ({ zoom = 1 }) => {
	const { contextMenu } = useGame();
	const managerState = useEventReducer(
		contextMenu.$changed,
		useCallback(() => contextMenu.state, [contextMenu]),
		[]
	);

	useEffect(() => {
		const cb = () => {
			contextMenu.close();
		};

		window.addEventListener('click', cb);
		return () => window.removeEventListener('click', cb);
	}, [contextMenu]);

	if (!managerState) {
		// The context menu is closed.
		return null;
	}

	return (
		<ViewportHtmlContainer location={managerState.location} width={0} height={0} zoom={zoom}>
			{managerState.contents}
		</ViewportHtmlContainer>
	);
};
export const RendererIsometric: FunctionComponent<{
	onTileClick: (typeof DualMeshTerrainC extends ComponentType<infer P>
		? P
		: never)['onTileClick'];
	onTileContextMenu: (typeof DualMeshTerrainC extends ComponentType<infer P>
		? P
		: never)['onTileContextMenu'];
	onEntityClick: (event: unknown, entity: EntityPersonI) => void;
	center: TileI;
}> = ({ onTileClick, onTileContextMenu, onEntityClick, center }) => {
	const game = useGame();
	const terrain = useMemo(
		() => (
			<DualMeshTerrainC
				terrain={game.terrain}
				onTileClick={onTileClick}
				onTileContextMenu={onTileContextMenu}
			/>
		),
		[onTileClick, onTileContextMenu, game.terrain]
	);

	const entities = useMemo(
		() =>
			game.entities
				.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
				.map(entity => (
					<PersonEntityC
						key={entity.id}
						entity={entity}
						onClick={
							onEntityClick
								? event => {
										onEntityClick(event, entity);
								  }
								: onEntityClick
						}
					/>
				)),
		[onEntityClick, game.entities]
	);

	return (
		<Viewport center={center} zoom={1} overlay={<ContextMenuContainer zoom={1} />}>
			<g id="scene__terrain">{terrain}</g>
			<g id="scene__entities">{entities}</g>
		</Viewport>
	);
};
