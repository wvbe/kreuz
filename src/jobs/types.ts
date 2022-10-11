import { type Game } from '../../mod.ts';

/**
 * An activity that entities do.
 */
export interface JobI {
	label: string;
	start(game: Game): void;
	destroy(): void;
}
