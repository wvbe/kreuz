import { honey } from '../constants/materials.ts';
import { PERSON_NEEDS } from '../constants/needs.ts';
import { FactoryBuildingEntity } from '../entities/entity.building.factory.ts';
import { BuildingEntity } from '../entities/entity.building.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import type Game from '../Game.ts';
import { SelfcareNeedTask } from './task.self-care.need.ts';
import { Task } from './task.ts';

type NeedInfo = typeof PERSON_NEEDS extends Array<infer P> ? P : never;

export class SelfcareTask extends Task<[Game, PersonEntity]> {
	public constructor() {
		super(null);
	}

	protected getNextSubtask(_game: Game, entity: PersonEntity): Task<[Game, PersonEntity]> | null {
		const need = PERSON_NEEDS.filter((need) => entity.needs[need.id].get() < 0.25)
			.sort((a: NeedInfo, b: NeedInfo) => entity.needs[a.id].get() - entity.needs[b.id].get())
			.shift();
		if (!need) {
			return null;
		}

		if (need.id === 'ideology') {
			return new SelfcareNeedTask({
				needId: need.id,
				entityFilter: (e) => e.type === 'church',
			});
		} else if (need.id === 'water') {
			return new SelfcareNeedTask({
				needId: need.id,
				entityFilter: (e) => e.type === 'settlement' || e instanceof BuildingEntity,
			});
		} else if (need.id === 'food') {
			return new SelfcareNeedTask({
				needId: need.id,
				entityFilter: (e) => {
					if (!(e instanceof FactoryBuildingEntity)) {
						return false;
					}
					const building = e as FactoryBuildingEntity;
					const hasEdible = building.inventory.some(
						({ material, quantity }) => quantity > 0 && material === honey,
					);
					return hasEdible;
				},
			});
		} else if (need.id === 'sleep') {
			return new SelfcareNeedTask({
				needId: need.id,
				entityFilter: (e) => e.type === 'settlement',
			});
		} else if (need.id === 'hygiene') {
			return new SelfcareNeedTask({
				needId: need.id,
				entityFilter: (e) => e.type === 'settlement',
			});
		}

		// Programmer error:
		throw new Error(`Unknown need "${need.id}"`);
	}
}
