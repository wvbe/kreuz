import Color from 'color';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { ExcavationJob } from '../../game/assets/commands/ExcavationJob';
import { ConstructionJob } from '../../game/assets/construction/ConstructionJob';
import {
	woodenBed,
	woodenCabinet,
	woodenChair,
	woodenFootrest,
	woodenStool,
	woodenTable,
} from '../../game/assets/construction/furnitureMaterials';
import { Constructible } from '../../game/assets/construction/types';
import { JobPriority } from '../../game/core/classes/JobBoard';
import { useGameContext } from '../contexts/GameContext';
import { Button, ButtonProps } from '../hud/atoms/Button';
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
					if (!ExcavationJob.tileIsExcavateable(game, tile)) {
						continue;
					}
					game.jobs.add(JobPriority.NORMAL, new ExcavationJob(tile));
				}
			},
		});
	}, [setTilePaintMode, game]);

	const furnitureButtons = useMemo<ReactNode[]>(() => {
		const createProps = (furniture: Constructible): ButtonProps => {
			const id = `construct.${furniture.label}`;
			return {
				children: furniture.label,
				icon: furniture.symbol,
				layout: 'tile',
				active: tilePaintMode?.id === id,
				onClick: () => {
					setTilePaintMode({
						id,
						highlightColor: new Color('red'),
						onDragComplete: (tiles) => {
							for (const tile of tiles) {
								if (!ConstructionJob.tileIsBuildable(game, tile)) {
									continue;
								}
								game.jobs.add(
									JobPriority.NORMAL,
									new ConstructionJob(tile, furniture),
								);
							}
						},
					});
				},
			};
		};
		return [
			createProps(woodenChair),
			createProps(woodenBed),
			createProps(woodenTable),
			createProps(woodenStool),
			createProps(woodenCabinet),
			createProps(woodenFootrest),
		].map((props) => <Button {...props} />);
	}, [tilePaintMode, setTilePaintMode, game]);

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
						Build
					</Button>
				)}
				renderPopoverContents={() => (
					<div className='game-action-bar'>{furnitureButtons}</div>
				)}
			/>
		</Panel>
	);
};
