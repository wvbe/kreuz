import { EntityPersonI } from '../types';
import { PersonEntity } from './PersonEntity';

export class GuardEntity extends PersonEntity implements EntityPersonI {
	public get label(): string {
		return `Guardsman ${this.passport.firstName}`;
	}
}
