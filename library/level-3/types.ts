import { type Game, type DriverI } from '@lib/core';

export type Demo<D extends DriverI = DriverI> = (driver: DriverI) => Promise<{
	driver: D;
	game: Game;
}>;
