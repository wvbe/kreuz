import { EventedPromise } from '../classes/EventedPromise.ts';
import { Path } from '../classes/Path.ts';
import { PERSON_NEEDS } from '../constants/needs.ts';
import { ChurchBuildingEntity } from '../entities/entity.building.church.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import Game from '../Game.ts';
import { TileI } from '../types.ts';
import { Job } from './Job.ts';
import { type JobI } from './types.ts';

type NeedInfo = typeof PERSON_NEEDS extends Array<infer P> ? P : never;

type CurrentFocus = {
	need: NeedInfo;
	stop: () => void;
};

/**
 * The self-care job lets an entity tend to their needs -- if they're hungry, they eat; if they're
 * thirsy, they drink.
 *
 * The job may include (@TODO) collecting the materials with which some needs are assuaged.
 */
export class SelfcareJob extends Job<PersonEntity> implements JobI {
	constructor(entity: PersonEntity) {
		super();

		function sortByNeedUrgency(a: NeedInfo, b: NeedInfo) {
			return entity.needs[a.id].get() - entity.needs[b.id].get();
		}

		let currentNeed: null | CurrentFocus = null;

		this.$attach.on((game) => {
			PERSON_NEEDS.forEach((need) => {
				this.$detach.once(
					entity.needs[need.id].onBetween(-Infinity, 0.25, () => {
						// @TODO possible bug? Not always picking the best option
						// @TODO collect this over all need events, once
						const mostUrgent = PERSON_NEEDS.slice().sort(sortByNeedUrgency)[0];
						if (!mostUrgent) {
							// Great! No urgent needs. Entity can continue doing what they were doing.
							return;
						}
						if (mostUrgent === currentNeed?.need) {
							return;
						}
						if (currentNeed) {
							currentNeed.stop();
						}
						currentNeed = this.startSatisfyingNeed(game, entity, mostUrgent);
					}),
				);
			});
		});
	}

	private getUrgentNeeds(entity: PersonEntity): NeedInfo[] {
		return PERSON_NEEDS.filter((need) => entity.needs[need.id].get() < 0.15);
	}
	private getUnsafisfiedNeeds(entity: PersonEntity): NeedInfo[] {
		return PERSON_NEEDS.filter((need) => entity.needs[need.id].get() < 0.8);
	}

	private startSatisfyingNeed(
		game: Game,
		entity: PersonEntity,
		need: NeedInfo,
	): null | CurrentFocus {
		console.log('Satisfy need', need);
		if (need.id === 'spirituality') {
			this.startSatisfyingSpiritualityNeed(game, entity);
		}
		return null;
	}

	/**
	 * Returns `null` if the job could not be started, or a promise otherwise. The promise will
	 * resolve when the job is completed, or reject when it is interrupted.
	 */
	private async startSatisfyingSpiritualityNeed(game: Game, entity: PersonEntity): Promise<void> {
		const { x, y } = entity.$$location.get();
		const start = game.terrain.getTileEqualToXy(x, y);
		if (!start) {
			// Programmer error somewhere
			throw new Error('Bzzt');
		}

		// Find the nearest reachable church
		const shortest = new Path(game.terrain, {
			closest: false,
		}).findPathToClosest(
			start,
			game.entities
				.filter<ChurchBuildingEntity>((entity) => entity instanceof ChurchBuildingEntity)
				.map((entity) => {
					const { x, y } = entity.$$location.get();
					return game.terrain.getTileEqualToXy(x, y);
				})
				.filter((tile): tile is TileI => {
					if (!tile) {
						// Programmer error somewhere
						throw new Error('Bzzt');
					}
					return true;
				}),
		);
		if (!shortest) {
			return Promise.reject();
		}

		// Walk there
		await entity.walkAlongPath(shortest.path);
		console.log(`${entity.label} has arrived at a church`);

		// Start worshipping, gain some spirituality
		const { $finish, $interrupt, promise } = new EventedPromise();
		const stopListeningForJobChange = entity.$$job.once(() => {
			$interrupt.emit();
		});
		$finish.once(stopListeningForJobChange);
		$interrupt.once(stopListeningForJobChange);
		const oldDelta = entity.needs.spirituality.delta;
		$interrupt.once(
			entity.needs.spirituality.onceBetween(1, Infinity, () => {
				entity.needs.spirituality.setDelta(oldDelta);
				$finish.emit();
			}),
		);
		entity.needs.spirituality.setDelta(1 / 5000);

		return promise;
	}

	get label() {
		return `Taking care of self`;
	}
}
