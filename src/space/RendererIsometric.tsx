import React, { ComponentType, FunctionComponent, useMemo } from 'react';
import { PersonEntity } from '../entities/PersonEntity';
import { PersonEntityC } from '../entities/PersonEntityC';
import { useGame } from '../hooks/game';
import { DualMeshTerrainC } from '../terrain/DualMeshTerrainC';
import { EntityPersonI, TileI } from '../types';
import { ContextMenuContainer } from '../ui/ContextMenu';
import { Viewport } from './Viewport';

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
