import { Driver, EntityI, PersonEntity, type DriverI, type Game } from '@lib';
import { setSelectedEntity } from '../hooks/useSelectedEntity.ts';
export class AlephDriver extends Driver implements DriverI {
	game: Game | null = null;
	gameSpeed = 6;
	lastUpdate: number;
	constructor() {
		super();
		this.lastUpdate = Date.now();
	}

	private animate(game: Game) {
		if (!this.$$animating.get()) {
			return;
		}

		const now = Date.now();
		const delta = now - this.lastUpdate;
		game.time.steps(delta * this.gameSpeed);
		this.lastUpdate = now;
		setTimeout(this.animate.bind(this, game), 10);
	}

	public attach(game: Game): this {
		this.game = game;
		super.attach(game);

		this.$detach.once(
			this.$start.on(() => {
				this.animate(game);

				return () => {
					this.stop();
				};
			}),
		);

		// Whenever an entity starts to move, make sure that the "animation" ends at some point too.
		this.$detach.once(
			game.entities.$add.on((added) => {
				added
					.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
					.forEach((entity) => {
						this.$detach.once(
							entity.$stepStart.on((_destination, duration, done) => {
								game.time.setTimeout(done, duration);
							}),
						);
					});
			}),
		);

		return this;
	}

	setSelectedEntity(entity: EntityI | null) {
		setSelectedEntity(entity);
	}
}
