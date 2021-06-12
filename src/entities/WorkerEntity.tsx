import { PersonEntity } from './PersonEntity';

export class WorkerEntity extends PersonEntity {
	get label(): string {
		return `Worker ${this.passport.firstName}`;
	}
}
