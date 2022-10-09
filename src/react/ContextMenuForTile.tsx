import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { SettlementEntity } from '../entities/SettlementEntity.ts';
import Game from '../Game.ts';
import { TileI } from '../types.ts';
import { EntityTextBadge } from './ActiveEntityOverlay.tsx';
import { Button } from './components/Button.tsx';
import { ContextMenu, ContextMenuFooter } from './components/ContextMenu.tsx';

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
	tile,
}) => {
	const settlement = game.entities.find(
		(entity) =>
			game.terrain.getTileClosestToXy(entity.$$location.get().x, entity.$$location.get().y) ===
				tile && entity instanceof SettlementEntity,
	);
	return (
		<ContextMenu>
			{settlement ? (
				<ContextMenuFooter>
					<EntityTextBadge entity={settlement} />
				</ContextMenuFooter>
			) : null}
			<Button
				wide
				onClick={() => {
					game.$$cameraFocus.set(tile);
				}}
			>
				Center camera
			</Button>
			<Button
				wide
				onClick={() => {
					console.group(`Tile ${tile}`);
					console.log(tile);
					console.groupEnd();
				}}
			>
				Show in console
			</Button>
			<ContextMenuFooter>
				<AxisX>{tile.x.toFixed(2)}</AxisX>
				{', '}
				<AxisY>{tile.y.toFixed(2)}</AxisY>
				{', '}
				<AxisZ>{tile.z.toFixed(2)}</AxisZ>
			</ContextMenuFooter>
		</ContextMenu>
	);
};
