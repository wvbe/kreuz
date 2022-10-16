import { Driver, PersonEntity, type DriverI, type Game } from '@lib';

export class AlephDriver extends Driver implements DriverI {
	game: Game;
	lastUpdate: number;
	constructor(game: Game) {
		super();
		this.game = game;
		this.lastUpdate = Date.now();
	}
	public animate() {
		if (!this.$$animating.get()) {
			return;
		}

		const now = Date.now();
		const delta = now - this.lastUpdate;
		this.game.time.steps(delta);
		this.lastUpdate = now;
		setTimeout(() => this.animate(), 10);
	}
	public attach(game: Game): this {
		super.attach(game);

		this.$detach.once(
			this.$start.on(() => {
				this.animate();

				return () => {
					this.stop();
				};
			}),
		);

		// Whenever an entity starts to move, make sure that the "animation" ends at some point too.
		game.entities
			.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
			.forEach((entity) => {
				this.$detach.once(
					entity.$stepStart.on((_destination, duration, done) => {
						game.time.setTimeout(done, duration);
					}),
				);
			});

		return this;
	}
}
