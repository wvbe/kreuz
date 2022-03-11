import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { Game } from './Game';
import { RendererIsometric } from './rendering/RendererIsometric';
import { RendererThree } from './rendering/RendererThree';
import { EntityI, TileI } from './types';
import { ActiveEntityOverlay } from './ui/ActiveEntityOverlay';
import { ContextMenu, ContextMenuButton, ContextMenuFooter } from './ui/ContextMenu';
import { Overlay } from './ui/Overlay';

// https://color.adobe.com/Fresh-flat-bright-color-theme-8718197
const AxisX = styled.span`
	color: #ff4639;
`;
const AxisY = styled.span`
	color: #51a2ff;
`;
const AxisZ = styled.span`
	color: #ffdd41;
`;
export const GameC: FunctionComponent<{
	game: Game;
	initialViewportCenter: TileI;
	asIsometric?: boolean;
}> = ({ game, initialViewportCenter, asIsometric }) => {
	const [center, setCenter] = useState(initialViewportCenter);
	const onTileClick = useCallback(
		(tile: TileI) => {
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
					<ContextMenuFooter>
						<AxisX>{tile.x.toFixed(2)}</AxisX>
						{', '}
						<AxisY>{tile.y.toFixed(2)}</AxisY>
						{', '}
						<AxisZ>{tile.z.toFixed(2)}</AxisZ>
					</ContextMenuFooter>
				</ContextMenu>
			);
		},
		[game.contextMenu]
	);

	const onTileContextMenu = useCallback(tile => {
		setCenter(tile);
	}, []);

	const [activeEntity, setActiveEntity] = useState<EntityI | undefined>(undefined);
	const onEntityClick = useCallback(entity => {
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
