import { PersonEntity } from '../entities/PersonEntity';
import { Random } from '../util/Random';
import { Job } from './Job';

export class LoiterJob extends Job<PersonEntity> {
	// The minimum and maximum amounts of ms before considering to move again, after having walked
	private walkMinWait = 2000;
	private walkMaxWait = 10000;

	// Every time that the entity might make a move, there's a good chance that they'll change their
	//   mind and lazy out instead.
	private walkChanceOnRoll = 0.3;

	// If the entity chooses to walk, its no more than this amount of times
	private walkMaxDistance = 7;

	get label() {
		return `Loitering`;
	}

	start() {
		let steps = 0;
		const doTimeout = () =>
			setTimeout(() => {
				if (Math.random() > this.walkChanceOnRoll) {
					doTimeout();
					return;
				}
				steps++;
				const destinations =
					this.entity.location?.terrain?.selectClosestTiles(
						this.entity.location,
						this.walkMaxDistance
					) || [];
				this.entity.walkTo(
					Random.arrayItem(destinations, this.entity.id, 'roam-destination', steps)
				);
			}, this.walkMinWait + Random.float(this.entity.id, 'roam-delay', steps) * (this.walkMaxWait - this.walkMinWait));

		const destroyers = [this.entity.pathEnd.on(doTimeout)];

		doTimeout();

		return () => destroyers.forEach(d => d());
	}
}
