import { type Game, type DriverI } from '../level-1.ts';

export type Demo<D extends DriverI = DriverI> = (driver: DriverI) => {
	driver: D;
	game: Game;
};
