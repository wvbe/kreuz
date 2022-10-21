import type Game from '../Game.ts';

/**
 * An activity that entities do.
 */
export interface JobI {
	label: string;
	attach(game: Game): void;
	detach(): void;
}
