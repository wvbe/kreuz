import { type Game, type DriverI } from '@lib';

export type Demo<D extends DriverI = DriverI> = (driver: DriverI) => {
	driver: D;
	game: Game;
};
