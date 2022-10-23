import { EventedPromise } from '../classes/EventedPromise.ts';
import { Path } from '../classes/Path.ts';
import { PERSON_NEEDS } from '../constants/needs.ts';
import { BuildingEntity } from '../entities/entity.building.ts';
import { ChurchBuildingEntity } from '../entities/entity.building.church.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import { Need } from '../entities/Need.ts';
import { EntityI } from '../entities/types.ts';
import Game from '../Game.ts';
import { DestroyerFn, TileI } from '../types.ts';
import { Job } from './Job.ts';
import { type JobI } from './types.ts';
import { FactoryBuildingEntity } from '../entities/entity.building.factory.ts';
import { honey } from '../constants/materials.ts';

type NeedInfo = typeof PERSON_NEEDS extends Array<infer P> ? P : never;

type CurrentFocus = {
	need: NeedInfo;
	stop: () => void;
};

enum Cancel {
	NO_SUPPLIER,
	INTERRUPTED,
}
/**
 * The self-care job lets an entity tend to their needs -- if they're hungry, they eat; if they're
 * thirsy, they drink.
 *
 * The job may include (@TODO) collecting the materials with which some needs are assuaged.
 */
export class SelfcareJob extends Job<PersonEntity> implements JobI {
	constructor(entity: PersonEntity) {
		super();

		this.$attach.on((game) => {
			let running = true;
			let unsetTimeout: DestroyerFn | null = null;

			const loop = async (): Promise<void> => {
				const fulfilledAnything = await this.startSatisfyingNeed(game, entity);
				if (!fulfilledAnything) {
					await new Promise((resolve) => {
						unsetTimeout = game.time.setTimeout(resolve, 10_000);
					});
				}
				if (running) {
					return loop();
				}
			};

			void loop();

			this.$detach.once(() => {
				running = false;
				unsetTimeout?.();
			});
		});
	}

	private getUrgentNeeds(entity: PersonEntity): NeedInfo[] {
		return PERSON_NEEDS.filter((need) => entity.needs[need.id].get() < 0.15);
	}
	private getUnsafisfiedNeeds(entity: PersonEntity): NeedInfo[] {
		return PERSON_NEEDS.filter((need) => entity.needs[need.id].get() < 0.8);
	}

	/**
	 * Returns a boolean
	 * TRUE if any need was serviced succesfully
	 * FALSE if no need was fulfilled, or the attempt aborted
	 */
	private startSatisfyingNeed(game: Game, entity: PersonEntity): Promise<boolean> {
		return PERSON_NEEDS.filter((need) => entity.needs[need.id].get() < 0.25)
			.sort((a: NeedInfo, b: NeedInfo) => entity.needs[a.id].get() - entity.needs[b.id].get())
			.reduce<Promise<boolean>>(async (last, need) => {
				if (await last) {
					return last;
				}
				try {
					if (need.id === 'ideology') {
						await this.startSatisfyingIdeologyNeed(game, entity);
						return true;
					} else if (need.id === 'water') {
						await this.startSatisfyingWaterNeed(game, entity);
						return true;
					} else if (need.id === 'food') {
						await this.startSatisfyingFoodNeed(game, entity);
						return true;
					} else if (need.id === 'sleep') {
						await this.startSatisfyingSleepNeed(game, entity);
						return true;
					} else if (need.id === 'hygiene') {
						await this.startSatisfyingHygieneNeed(game, entity);
						return true;
					}
				} catch (error: unknown) {
					if ((error as Cancel) in Cancel) {
						return false;
					}
					throw error;
				}
				return false;
			}, Promise.resolve(false));
	}

	/**
	 * Returns `null` if the job could not be started, or a promise otherwise. The promise will
	 * resolve when the job is completed, or reject when it is interrupted.
	 */
	private async startSatisfyingIdeologyNeed(game: Game, entity: PersonEntity): Promise<void> {
		await this.#walkAvatarToNearestEntity(game, entity, (e) => e.type === 'church');
		await this.#waitWhileReceivingNeed(entity, entity.needs.ideology);
	}
	/**
	 * Returns `null` if the job could not be started, or a promise otherwise. The promise will
	 * resolve when the job is completed, or reject when it is interrupted.
	 */
	private async startSatisfyingWaterNeed(game: Game, entity: PersonEntity): Promise<void> {
		await this.#walkAvatarToNearestEntity(game, entity, (e) => e instanceof BuildingEntity);
		await this.#waitWhileReceivingNeed(entity, entity.needs.water);
	}
	private async startSatisfyingSleepNeed(game: Game, entity: PersonEntity): Promise<void> {
		await this.#walkAvatarToNearestEntity(game, entity, (e) => e.type === 'settlement');
		await this.#waitWhileReceivingNeed(entity, entity.needs.sleep);
	}
	private async startSatisfyingHygieneNeed(game: Game, entity: PersonEntity): Promise<void> {
		await this.#walkAvatarToNearestEntity(game, entity, (e) => e.type === 'settlement');
		await this.#waitWhileReceivingNeed(entity, entity.needs.hygiene);
	}

	private async startSatisfyingFoodNeed(game: Game, entity: PersonEntity): Promise<void> {
		await this.#walkAvatarToNearestEntity(game, entity, (e) => {
			if (!(e instanceof FactoryBuildingEntity)) {
				return false;
			}
			const building = e as FactoryBuildingEntity;
			const hasEdible = building.inventory.some(
				({ material, quantity }) => quantity > 0 && material === honey,
			);
			return hasEdible;
		});
		await this.#waitWhileReceivingNeed(entity, entity.needs.food);
	}

	async #walkAvatarToNearestEntity<P extends EntityI>(
		game: Game,
		entity: PersonEntity,
		filter: (tile: EntityI) => boolean,
	): Promise<void> {
		const { x, y } = entity.$$location.get();
		const start = game.terrain.getTileEqualToXy(x, y);
		if (!start) {
			// Programmer error somewhere
			throw new Error('Bzzt');
		}
		const candidates = game.entities
			.filter<P>(filter)
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
			});
		if (candidates.includes(start)) {
			return Promise.resolve();
		}

		if (!candidates.length) {
			return Promise.reject(Cancel.NO_SUPPLIER);
		}
		// Find the nearest reachable church
		const shortest = new Path(game.terrain, { closest: false }).findPathToClosest(
			start,
			candidates,
		);
		if (!shortest) {
			return Promise.reject(Cancel.NO_SUPPLIER);
		}

		// Walk there
		await entity.walkAlongPath(shortest.path);
	}

	async #waitWhileReceivingNeed(entity: PersonEntity, need: Need): Promise<void> {
		const { $finish, $interrupt, promise } = new EventedPromise();
		const stopListeningForJobChange = entity.$$job.once(() => {
			$interrupt.emit(Cancel.INTERRUPTED);
		});
		$finish.once(stopListeningForJobChange);
		$interrupt.once(stopListeningForJobChange);
		const oldDelta = need.delta;
		$interrupt.once(
			need.onceBetween(1, Infinity, () => {
				need.setDelta(oldDelta);
				$finish.emit();
			}),
		);
		need.setDelta(1 / 5000);

		await promise;
	}

	get label() {
		return `Taking care of self`;
	}
}
