import { type Game, type DriverI } from '../level-1/mod.ts';

export type Demo<D extends DriverI = DriverI> = (driver: DriverI) => Promise<{
	driver: D;
	game: Game;
}>;
