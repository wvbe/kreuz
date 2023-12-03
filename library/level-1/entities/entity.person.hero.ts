import { PersonEntity } from './entity.person.ts';

export class HeroPersonEntity extends PersonEntity {
	private readonly prefix: string;
	constructor(prefix: string, ...rest: ConstructorParameters<typeof PersonEntity>) {
		super(...rest);
		this.prefix = prefix;
	}

	public get name(): string {
		return `${this.prefix} ${this.passport.firstName}`;
	}
	public get icon(): string {
		return this.passport.gender === 'm' ? '👑' : '👑';
	}
}
