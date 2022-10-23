import { EventedPromise } from '../classes/EventedPromise.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { CallbackFn } from '../types.ts';
import { Task } from './Task.ts';

export class SelfcareTask extends Task {
	public constructor(entity: PersonEntity) {
		super(null, []);
	}
}
