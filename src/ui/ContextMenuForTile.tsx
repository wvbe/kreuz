import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { Game } from '../Game';
import { TileI } from '../types';
import { ContextMenu, ContextMenuButton, ContextMenuFooter } from './components/ContextMenu';

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

export const ContextMenuForTile: FunctionComponent<{ game: Game; tile: TileI }> = ({
	game,
	tile
}) => (
	<ContextMenu>
		<ContextMenuButton
			onClick={() => {
				game.$$lookAt.set(tile);
			}}
		>
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
