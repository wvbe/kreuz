import { Driver, PersonEntity, type DriverI, type Game, EntityI } from '@lib';

export class BrowserDriver extends Driver implements DriverI {
	game: Game | null = null;
	gameSpeed = 1;
	lastUpdate: number = Date.now();

	private async animate(game: Game) {
		if (!this.$$animating.get()) {
			return;
		}
		if (!game.time.hasNextEvent()) {
			await this.$end.emit();
			return;
		}

		const now = Date.now();
		const delta = now - this.lastUpdate;
		await game.time.steps(delta * this.gameSpeed);
		this.lastUpdate = now;
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

		const listenToPersonEntityMovement = (entities: EntityI[]) => {
			entities
				.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
				.forEach((entity) => {
					this.$detach.once(
						entity.$stepStart.on((_destination, duration, done) => {
							game.time.setTimeout(done, duration);
						}),
					);
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
