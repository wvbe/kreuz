import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Logger from './classes/Logger';
import { Game } from './Game';
import { RendererIsometric } from './space/RendererIsometric';
import { EntityI, TileI } from './types';
import { ActiveEntityOverlay } from './ui/ActiveEntityOverlay';
import { ContextMenuButton, ContextMenuFooter } from './ui/ContextMenu';
import { Overlay } from './ui/Overlay';

function fancyTimeFormat(seconds: number) {
	return `${~~((seconds % 3600) / 60)}′ ${Math.floor(seconds % 60)}″`;
}
function fakeCoordinates(x: number, y: number) {
	return `40° ${fancyTimeFormat(1000 - x * 13)} N 79° ${fancyTimeFormat(700 - y * 13)} W`;
}
export const GameC: FunctionComponent<{
	game: Game;
	initialViewportCenter: TileI;
}> = ({ game, initialViewportCenter }) => {
	const [center, setCenter] = useState(initialViewportCenter);
	useEffect(() => {
		const cb = () => {
			game.contextMenu.close();
		};

		window.addEventListener('click', cb);
		return () => window.removeEventListener('click', cb);
	}, [game.contextMenu]);
	const onTileClick = useCallback(
		(event, tile) => {
			game.contextMenu.open(
				tile,
				<>
					<ContextMenuButton onClick={() => setCenter(tile)}>
						Center camera
					</ContextMenuButton>
					<ContextMenuButton
						onClick={() => {
							Logger.group(`Tile ${tile}`);
							Logger.log(tile);
							Logger.groupEnd();
						}}
					>
						Show in console
					</ContextMenuButton>
					<ContextMenuFooter>{fakeCoordinates(tile.x, tile.y)}</ContextMenuFooter>
				</>
			);
		},
		[game.contextMenu]
	);
	const onTileContextMenu = useCallback((event, tile) => {
		setCenter(tile);
	}, []);

	const [activeEntity, setActiveEntity] = useState<EntityI | undefined>(undefined);
	const onEntityClick = useCallback((event, entity) => {
		event.preventDefault();
		setActiveEntity(entity);
	}, []);

	return (
		<>
			<RendererIsometric
				onTileClick={onTileClick}
				onTileContextMenu={onTileContextMenu}
				onEntityClick={onEntityClick}
				center={center}
			/>
			<Overlay>
				<ActiveEntityOverlay entity={activeEntity} />
				<p style={{ fontSize: '0.8em', opacity: '0.5' }}>
					<a
						href="https://github.com/wvbe/kreuzzeug-im-nagelhosen"
						target="_blank"
						rel="noreferrer"
					>
						GitHub
					</a>
					{'    '}
					Seed: {game.seed}
				</p>
			</Overlay>
		</>
	);
};
