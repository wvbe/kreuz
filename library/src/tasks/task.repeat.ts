import { type PersonEntity } from '../entities/entity.person.ts';
import type Game from '../Game.ts';
import { Task } from './task.ts';

/**
 * A task that means to simply repeat another task forever, with only a small pause (5000 time) in between/
 */
export class RepeatingTask extends Task<[Game, PersonEntity]> {
	#createRepeatingTask: () => Task<[Game, PersonEntity]>;

	public constructor(createRepeatingTask: () => Task<[Game, PersonEntity]>) {
		super(null);
		this.#createRepeatingTask = createRepeatingTask;
	}

	protected async getNextSubtask(game: Game, entity: PersonEntity) {
		await new Promise((res) => game.time.setTimeout(res, 5000));

		return this.#createRepeatingTask();
	}
}
