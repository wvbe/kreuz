import { Driver } from '../../game/core/drivers/Driver.js';
import { DriverI } from '../../game/core/drivers/types.js';
import { byEcsComponents } from '../../game/core/ecs/assert.js';
import { pathingComponent } from '../../game/core/ecs/components/pathingComponent.js';
import { EcsEntity } from '../../game/core/ecs/types.js';
import Game from '../../game/core/Game.js';

/**
 * Hooks the game's time progression into the browser's requestAnimationFrame loop.
 *
 * The idea is cute but the execution is a bit messy.
 *
 * Or as the AI puts it:
 *
 *    "The main problem is that the game's time progression is not a single event, but a sequence of events.
 *     This means that we need to be able to pause and resume the animation loop, and we need to be able to
 *     handle the case where the game's time progression is paused and then resumed."
 *
 *     "This is a bit messy to implement, and it's not really worth the effort."
 */
export class BrowserDriver extends Driver implements DriverI {
	game: Game | null = null;
	lastUpdate: number = Date.now();

	private async animate(game: Game) {
		if (!this.$$animating.get()) {
			return;
		}
		if (!game.time.hasNextEvent()) {
			await this.stop();
			await this.$end.emit();
			return;
		}

		const now = Date.now();
		const delta = now - this.lastUpdate;
		this.lastUpdate = now;
		await game.time.stepsForDelta(delta);
		requestAnimationFrame(this.animate.bind(this, game));
	}

	public async start(): Promise<void> {
		this.lastUpdate = Date.now();
		await super.start();
	}

	public async attach(game: Game): Promise<this> {
		if (this.game) {
			throw new Error('Driver is already attached to a game');
		}
		this.game = game;
		await super.attach(game);

		const onFocus = async () => {
			if (this.$$animating.get()) {
				return;
			}
			await this.start();
		};
		self.addEventListener('focus', onFocus);
		this.$detach.once(() => self.removeEventListener('focus', onFocus));

		const onBlur = async () => {
			if (!this.$$animating.get()) {
				return;
			}
			await this.stop();
		};
		self.addEventListener('blur', onBlur);
		this.$detach.once(() => self.removeEventListener('blue', onBlur));

		this.$detach.once(
			this.$resume.on(async () => {
				await this.animate(game);
			}),
		);

		this.$detach.once(
			this.$resume.on(() => {
				self.document.title = '⏩ Kreuz';
			}),
		);

		this.$detach.once(
			this.$pause.on(() => {
				self.document.title = '⏸️ Kreuz';
			}),
		);
		this.$detach.once(
			this.$end.on(() => {
				self.document.title = '⏹️ Kreuz';
			}),
		);

		const listenToPersonEntityMovement = (entities: EcsEntity[]) => {
			entities.filter(byEcsComponents([pathingComponent])).forEach((entity) => {
				const destroy = entity.$stepStart.on((step) => {
					if (step === null) {
						return;
					}
					game.time.setTimeout(step.done, step.duration);
				});
				this.$detach.once(destroy);

				// Perform initial step if it was set before driver was attached to game:
				const step = entity.$stepStart.get();
				if (step === null) {
					return;
				}
				game.time.setTimeout(step.done, step.duration);
			});
		};
		// Whenever an entity starts to move, make sure that the "animation" ends at some point too.
		this.$detach.once(
			game.entities.$add.on((added) => {
				listenToPersonEntityMovement(added);
			}),
		);
		listenToPersonEntityMovement(game.entities.slice());

		return this;
	}
}
