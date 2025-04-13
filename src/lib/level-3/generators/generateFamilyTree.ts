import { Random } from 'src/lib/level-1/classes/Random';
import { Time } from 'src/lib/level-1/time/Time';

type Sexuality = 'hetero' | 'homo' | 'bi';
// type TraditionalGender = 'm' | 'f';

export async function generateFamilyTree(seed: number, dateMax: number) {
	const TIME = new Time();
	let seedIncrement = seed;
	const events: string[] = [];

	function EVENT<Things extends unknown[] = []>(str: TemplateStringsArray, ...things: Things) {
		const message = str.reduce(
			(message, text, i) => message + text + (i < things.length ? String(things[i]) : ''),
			`On day ${TIME.now}, `,
		);
		events.push(message);
		return message;
	}

	let personId = 0;
	class Person {
		id: number;
		birthDate: number;
		deathDate: number | null = null;
		mother?: Person;
		father?: Person;
		children: Person[] = [];

		gender: string;
		sexuality: Sexuality;

		constructor(mother?: Person, father?: Person) {
			this.id = ++personId;
			this.birthDate = TIME.now;
			this.mother = mother;
			this.father = father;

			this.gender = Random.fromArray(['m', 'f'], ++seedIncrement);
			this.sexuality = Random.fromArray(
				['hetero', 'hetero', 'hetero', 'hetero', 'hetero', 'homo', 'bi'],
				++seedIncrement,
			);

			const c = this.gender === 'f' ? 'daughter' : 'son';
			if (!father && !mother) {
				EVENT`${this} born as nobodies ${c}`;
			} else if (!father || !mother) {
				EVENT`${this} born, ${c} of ${mother || father}`;
			} else if (!father.isMarriedWith(mother)) {
				EVENT`${this} born, bastard ${c} of ${father} and ${mother}`;
			} else {
				EVENT`${this} born, ${c} of ${father} and ${mother}`;
			}
		}
		get label() {
			return `[ ${this.id} ${this.age}/${this.gender}]`.toUpperCase();
		}
		toString() {
			return this.label;
		}
		get age() {
			return TIME.now - this.birthDate;
		}

		public get alive() {
			return this.deathDate === null;
		}
		public die() {
			this.deathDate = TIME.now;
			EVENT`${this} died at age ${this.age}`;
		}
		public chanceOfDying(): number {
			if (this.age > 99) {
				return 0.9;
			}

			return (this.age - 50) / 300;
		}
		partner?: Person;
		isMarriedWith(person: Person) {
			return this.partner === person;
		}
		canMarry() {
			if (this.partner) {
				return false;
			}
			if (this.age < 16) {
				return false;
			}
			return true;
		}
		canMarryWith(person: Person, asReciprocation: boolean) {
			if (person === this) {
				return false;
			}
			if (
				(this.sexuality === 'hetero' && this.gender === person.gender) ||
				(this.sexuality === 'homo' && this.gender !== person.gender)
			) {
				return false;
			}
			if (!this.canMarry()) {
				return false;
			}
			if (asReciprocation) {
				// The other party is proposing to us
				return true;
			} else if (!person.canMarryWith(this, true)) {
				return false;
			}
			// Currently no further limitations on who can marry who
			// @TODO maybe not marry your cousin
			return true;
		}

		marry(person: Person) {
			this.partner = person;
			person.partner = this;
			EVENT`${this} and ${person} married!`;
		}

		canHaveBabies() {
			const age = this.age;
			if (this.gender === 'f') {
				if (age < 15 || age > 45) {
					return false;
				}

				if (this.children.length && this.children[this.children.length - 1].age < 2) {
					return false;
				}
			} else if (this.gender === 'm') {
				if (age < 15) {
					return false;
				}
			}
			return true;
		}

		canHaveBabyWith(partner: Person) {
			if (this.gender === partner.gender) {
				return false;
			}
			if (!this.canHaveBabies() || !partner.canHaveBabies()) {
				return false;
			}
			return true;
		}

		haveBaby(partner: Person) {
			if (!this.canHaveBabyWith(partner)) {
				throw new Error(
					`${TIME.now} @ Sorry, ${this} person cannot have babies with ${partner} right now`,
				);
			}
			let child: Person;
			if (this.gender === 'f') {
				child = new Person(this, partner);
			} else if (this.gender === 'm') {
				child = new Person(partner, this);
			} else {
				throw new Error('Not implemented');
			}
			this.children.push(child);
			partner.children.push(child);
			return child;
		}
	}

	const PERSONS = Array.from(new Array(50)).map(() => new Person());
	TIME.on(() => {
		const populationAlive = PERSONS.filter((p) => p.alive);
		populationAlive
			.filter((p) => Random.boolean([++seedIncrement], p.chanceOfDying()))
			.forEach((p) => p.die());
		if (populationAlive.length > 9999) {
			return;
			// throw new Error('Max population reached');
		}
		const populationElegibleToMarry = populationAlive.filter((p) => p.canMarry());
		populationElegibleToMarry
			// Not everybody wants to get married all the time;
			.filter(() => {
				const r = Random.boolean([++seedIncrement], 0.2);
				return r;
			})
			.forEach((person, _i, all) => {
				if (all.length < 2) {
					// Never mind, there's nobody to marry with
					return;
				}
				// @TODO make it more likely to marry between ages 25-30
				const candidates = all.filter((p) => person.canMarryWith(p, false));
				if (!candidates.length) {
					// Partner was just married, possibly to someone else.
					return;
				}
				const possiblePartner = Random.fromArray(candidates, ++seedIncrement);
				person.marry(possiblePartner);
			});

		populationAlive
			.filter((p) => p.partner && p.canHaveBabyWith(p.partner))
			.filter(() => Random.boolean([++seedIncrement], 0.1))
			.forEach((person) => {
				if (!person.canHaveBabyWith(person.partner as Person)) {
					// Partner is female and just had a baby
					return;
				}
				PERSONS.push(person.haveBaby(person.partner as Person));
			});
	});

	await TIME.steps(dateMax);

	return {
		log: events,
		makeData: () => {
			const populationAlive = PERSONS.filter((p) => p.alive);
			return {
				population: populationAlive.length,
				populationCumulative: PERSONS.length,
				couples: populationAlive.filter((p) => p.partner?.alive).length / 2,
				widowers: populationAlive.filter((p) => p.partner && !p.partner.alive).length,
				percentageHasChildren:
					populationAlive.filter((p) => p.children.length).length /
					populationAlive.length,
			};
		},
	};
}
