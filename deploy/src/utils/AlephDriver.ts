import { Driver, EntityI, PersonEntity, type DriverI, type Game } from '@lib';
import { setSelectedEntity } from '../hooks/useSelectedEntity.ts';
export class AlephDriver extends Driver implements DriverI {
	game: Game | null = null;
	gameSpeed = 3;
	lastUpdate: number = Date.now();

	private animate(game: Game) {
		if (!this.$$animating.get()) {
			return;
		}

		const now = Date.now();
		// if (this.lastUpdate !== null) {
		const delta = now - this.lastUpdate;
		game.time.steps(delta * this.gameSpeed);
		// }
		this.lastUpdate = now;
		setTimeout(this.animate.bind(this, game), 10);
	}

	public start() {
		this.lastUpdate = Date.now();
		return super.start();
	}

	public attach(game: Game): this {
		this.game = game;
		super.attach(game);

		const onFocus = () => this.start();
		self.addEventListener('focus', onFocus);
		this.$detach.once(() => self.removeEventListener('focus', onFocus));

		const onBlur = () => {
			self.document.title = '[Pause]';
			this.stop();
		};
		self.addEventListener('blur', onBlur);
		this.$detach.once(() => self.removeEventListener('blue', onBlur));

		this.$detach.once(
			this.$resume.on(() => {
				this.animate(game);

				return () => {
					this.stop();
				};
			}),
		);

		this.$detach.once(
			this.$resume.on(() => {
				self.document.title = '[PLAY]';
			}),
		);
		this.$detach.once(
			this.$pause.on(() => {
				self.document.title = '[PAUSE]';
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
