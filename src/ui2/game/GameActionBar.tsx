import Color from 'color';
import React, { FC, useCallback } from 'react';
import { ExcavationJob } from '../../lib/level-2/commands/ExcavationJob';
import { useGameContext } from '../contexts/GameContext';
import { Button } from '../hud/atoms/Button';
import { Panel } from '../hud/atoms/Panel';
import { Popover } from '../hud/atoms/Popover';
import { TilePaintMode } from './hooks/useTilePaintMode';

export const GameActionBar: FC<{
	tilePaintMode: TilePaintMode | null;
	setTilePaintMode: (tilePaintMode: TilePaintMode | null) => void;
}> = ({ tilePaintMode, setTilePaintMode }) => {
	const game = useGameContext();
	const setPaintModeNull = useCallback(() => {
		setTilePaintMode(null);
	}, [setTilePaintMode]);

	const setPaintModeExcavate = useCallback(() => {
		setTilePaintMode({
			id: 'excavate',
			highlightColor: new Color('red'),
			onDragComplete: (tiles) => {
				for (const tile of tiles) {
					if (!ExcavationJob.tileIsExcavateable(tile)) {
						continue;
					}
					game.jobs.addGlobal(new ExcavationJob(tile));
				}
			},
		});
	}, [setTilePaintMode]);

	return (
		<Panel data-component='GameActionBar' className='game-action-bar'>
			<Button
				icon='🔍'
				layout='tile'
				onClick={setPaintModeNull}
				active={tilePaintMode === null}
			>
				Pan
			</Button>
			<Button
				icon='🪏'
				layout='tile'
				onClick={setPaintModeExcavate}
				active={tilePaintMode?.id === 'excavate'}
			>
				Excavate
			</Button>
			<Popover
				closeOnOutsideClick={false}
				renderPopoverAnchor={({ open, close, isOpen }) => (
					<Button
						icon='🧱'
						layout='tile'
						onClick={() => {
							isOpen ? close() : open();
							setPaintModeNull();
						}}
						active={isOpen}
					>
						Fill
					</Button>
				)}
				renderPopoverContents={() => (
					<div className='game-action-bar'>
						<Button
							icon='🔍'
							layout='tile'
							onClick={setPaintModeNull}
							active={tilePaintMode === null}
						>
							Pan
						</Button>
						<Button
							icon='🪏'
							layout='tile'
							onClick={setPaintModeExcavate}
							active={tilePaintMode?.id === 'excavate'}
						>
							Excavate
						</Button>
					</div>
				)}
			/>
		</Panel>
	);
};
