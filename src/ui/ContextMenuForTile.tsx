import styled from '@emotion/styled';
import { faCity, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FunctionComponent } from 'react';
import { BuildingEntity } from '../entities/BuildingEntity';
import { Entity } from '../entities/Entity';
import { PersonEntity } from '../entities/PersonEntity';
import { SettlementEntity } from '../entities/SettlementEntity';
import { Game } from '../Game';
import { TileI } from '../types';
import { EntityTextBadge } from './ActiveEntityOverlay';
import { Button } from './components/Button';
import { ContextMenu, ContextMenuFooter } from './components/ContextMenu';

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
}) => {
	const settlement = game.entities.find(
		entity =>
			game.terrain.getTileClosestToXy(
				entity.$$location.get().x,
				entity.$$location.get().y
			) === tile && entity instanceof SettlementEntity
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
