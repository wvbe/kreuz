import { ExcavationJob } from '../../game/assets/commands/ExcavationJob';
import { JobPriority } from '../../game/core/classes/JobBoard';
import { SurfaceType } from '../../game/core/ecs/components/surfaceComponent';
import Game from '../../game/core/Game';
import { RectangularSelectionTool } from '../tools/util/RectangularSelectionTool';
import { Action } from './types';

export const excavatorButton: Action = {
	icon: '⛏',
	onClick: async (game: Game) => {
		const tiles = await RectangularSelectionTool.asPromise({
			createJitTilesForSelection: true,
		});
		if (!tiles) {
			return;
		}

		for (const tile of tiles) {
			if (
				// tile.surfaceType.get() === SurfaceType.OPEN ||
				!ExcavationJob.canModifyTile(game, tile)
			) {
				continue;
			}
			game.jobs.add(
				JobPriority.NORMAL,
				new ExcavationJob(tile, {
					onSuccess: (tile) => {
						console.log('MODIFY TYIE', tile);
						tile.walkability = 1;
						tile.surfaceType.set(SurfaceType.OPEN);
					},
				}),
			);
		}
	},
};
