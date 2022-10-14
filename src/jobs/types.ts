import type Game from '../Game.ts';

/**
 * An activity that entities do.
 */
export interface JobI {
	label: string;
	start(game: Game): void;
	destroy(): void;
}
