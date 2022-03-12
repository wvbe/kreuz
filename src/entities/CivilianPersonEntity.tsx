import { EntityPersonI } from '../types';
import { PersonEntity } from './PersonEntity';

export class CivilianEntity extends PersonEntity implements EntityPersonI {
	get label(): string {
		return `${this.userData.firstName}`;
	}
}
