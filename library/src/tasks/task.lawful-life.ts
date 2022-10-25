import { SelfcareTask } from '../../mod.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import type Game from '../Game.ts';
import { PatrolTask } from './task.patrol.ts';
import { Task, TaskWithBacklog } from './task.ts';

export class LiveLawfully extends Task<[Game, PersonEntity]> {
	#index = 0;
	public constructor() {
		super(null);
		this.#index = 0;
	}
	protected async getNextSubtask(game: Game) {
		++this.#index;

		await new Promise((res) => game.time.setTimeout(res, 5000));
		if (this.#index % 2 === 0) {
			return new SelfcareTask();
		}
		return new PatrolTask({
			repeating: false,
		});
	}
}
