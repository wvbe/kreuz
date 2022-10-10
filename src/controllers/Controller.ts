import { Event } from '../classes/Event.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import Game from '../Game.ts';
import { ControllerI } from '../types.ts';

export class Controller implements ControllerI {
	/**
	 * Triggers whenever the controller animation loop is started or stopped.
	 */
	public $$animating = new EventedValue<boolean>(false, 'Controller#$$animating');

	/**
	 * Triggers whenever the controller animation loop is started.
	 */
	public readonly $start = new Event('Controller $start');

	/**
	 * Triggers whenever the controller animation loop is stopped.
	 */
	public readonly $stop = new Event('Controller $stop');

	public readonly $attach = new Event('Controller $attach');

	public readonly $detach = new Event('Controller $detach');

	/**
	 * Associate a game with this controller, meaning that you'll probably want to set a lot
	 * of event handlers.
	 */
	public attachToGame(game: Game): void {
		this.$attach.emit();

		this.$detach.once(
			// Whenever the controller starts/stops animating, start/stop the game too.
			this.$$animating.on((animating) => {
				if (animating) {
					game.start();
				} else {
					// Stop game
					// @TODO
				}
			}),
		);

		// Whenever the controller detaches, destroy the game.
		// @TODO maybe not.
		this.$detach.once(game.destroy.bind(game));
	}

	/**
	 * Remove any association between the game and this controller.
	 */
	public detachFromGame() {
		this.$detach.emit();
	}

	/**
	 * Start the concept of time, and any events or animation following it.
	 */
	startAnimationLoop(): void {
		if (this.$$animating.get()) {
			throw new Error('Animation already started');
		}
		this.$$animating.set(true);
		this.$start.emit();
	}

	/**
	 * Stop the animation loop, the opposite of startAnimationLoop(). Will also fire the opposite event.
	 */
	public stopAnimationLoop() {
		if (!this.$$animating.get()) {
			throw new Error('Animation not started');
		}
		this.$$animating.set(false);
		this.$stop.emit();
	}
}
