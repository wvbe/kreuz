import Logger from '../classes/Logger';
import { Random } from '../classes/Random';
import { JobI } from '../types';
import { Job } from './Job';

export class LoiterJob extends Job implements JobI {
	private readonly destroyers: (() => void)[] = [];

	// The minimum and maximum amounts of ms before considering to move again, after having walked
	private walkMinWait = 4000;
	private walkMaxWait = 15000;

	// Every time that the entity might make a move, there's a good chance that they'll change their
	//   mind and lazy out instead.
	private walkChanceOnRoll = 0.3;

	// If the entity chooses to walk, its no more than this amount of times
	private walkMaxDistance = 3;

	get label() {
		return `Loitering`;
	}
	start() {
		super.start();
		let steps = 0;
		let timer: NodeJS.Timeout | null = null;
		const doTimeout = () => {
			if (timer) {
				throw new Error('Timer for LoiterJob already exists');
			}
			timer = setTimeout(() => {
				timer = null;
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
					Random.fromArray(destinations, this.entity.id, 'roam-destination', steps)
				);
			}, this.walkMinWait + Random.float(this.entity.id, 'roam-delay', steps) * (this.walkMaxWait - this.walkMinWait));
		};

		this.destroyers.push(this.entity.$stoppedWalking.on(doTimeout));
		this.destroyers.push(() => {
			if (timer) {
				clearTimeout(timer);
			}
		});

		doTimeout();
	}

	destroy() {
		super.destroy();
		this.destroyers.forEach(destroy => destroy());
	}
}
