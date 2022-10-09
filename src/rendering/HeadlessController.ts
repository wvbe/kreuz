import { Event } from '../classes/Event.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import Game from '../Game.ts';
import { ControllerI } from '../types.ts';
import { Controller } from './Controller.ts';

export class HeadlessController extends Controller implements ControllerI {
	constructor() {
		super();
	}
	attachToGame(game: Game): void {
		super.attachToGame(game);
		this.$stop.once(
			this.$start.on(() => {
				setInterval(() => {
					if (game.time.now % 1000 === 0) {
						console.log('Time: ' + game.time.now);
					}
					game.time.step();
				}, 1);
			}),
		);
	}
}
