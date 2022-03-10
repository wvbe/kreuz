import React, { FunctionComponent, useCallback, useState } from 'react';
import { Game } from './Game';
import { RendererIsometric } from './rendering/RendererIsometric';
import { RendererThree } from './rendering/RendererThree';
import { EntityI, TileI } from './types';
import { ActiveEntityOverlay } from './ui/ActiveEntityOverlay';
import { ContextMenu, ContextMenuButton, ContextMenuFooter } from './ui/ContextMenu';
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
	asIsometric?: boolean;
}> = ({ game, initialViewportCenter, asIsometric }) => {
	const [center, setCenter] = useState(initialViewportCenter);
	const onTileClick = useCallback(
		tile => {
			game.contextMenu.open(
				tile,
				<ContextMenu>
					<ContextMenuButton onClick={() => setCenter(tile)}>
						Center camera
					</ContextMenuButton>
					<ContextMenuButton
						onClick={() => {
							console.group(`Tile ${tile}`);
							console.log(tile);
							console.groupEnd();
						}}
					>
						Show in console
					</ContextMenuButton>
					<ContextMenuFooter>{fakeCoordinates(tile.x, tile.y)}</ContextMenuFooter>
				</ContextMenu>
			);
		},
		[game.contextMenu]
	);
	const onTileContextMenu = useCallback(tile => {
		setCenter(tile);
	}, []);

	const [activeEntity, setActiveEntity] = useState<EntityI | undefined>(undefined);
	const onEntityClick = useCallback((event, entity) => {
		event.preventDefault();
		setActiveEntity(entity);
	}, []);

	return (
		<>
			{asIsometric ? (
				<RendererIsometric
					onTileClick={onTileClick}
					onTileContextMenu={onTileContextMenu}
					onEntityClick={onEntityClick}
					center={center}
				/>
			) : (
				<RendererThree
					onTileClick={onTileClick}
					onTileContextMenu={onTileContextMenu}
					onEntityClick={onEntityClick}
					center={center}
				/>
			)}
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
