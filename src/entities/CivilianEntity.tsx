import { PersonEntity } from './PersonEntity';

export class CivilianEntity extends PersonEntity {
	get label(): string {
		return `${this.passport.firstName}`;
	}
}
