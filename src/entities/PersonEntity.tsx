import { Event } from '../classes/Event';
import Logger from '../classes/Logger';
import { Path } from '../classes/Path';
import { Random } from '../classes/Random';
import { FIRST_NAMES_F, FIRST_NAMES_M } from '../constants/names';
import { EntityPersonI, CoordinateI, TileI } from '../types';
import { Entity } from './Entity';

export class PersonEntity extends Entity implements EntityPersonI {
	// The amount of game coordinate per millisecond
	private readonly walkSpeed = 1 / 1000;

	// The event that the person finishes a path, according to react-spring's timing
	public readonly $stoppedWalking = new Event<[]>();

	// The person started one step
	public readonly $startedWalking = new Event<[CoordinateI, number]>();

	// The person started finished one step, according to react-spring's timing
	public readonly $stoppedWalkStep = new Event<[CoordinateI]>();

	protected readonly userData: { gender: 'm' | 'f'; firstName: string };

	constructor(id: string, location: CoordinateI) {
		super(id, location);

		const gender = Random.boolean([id, this.constructor.name, 'gender']);
		const firstName = Random.fromArray(
			gender ? FIRST_NAMES_M : FIRST_NAMES_F,
			id,
			this.constructor.name,
			'firstName'
		);
		this.userData = {
			gender: gender ? 'm' : 'f',
			firstName
		};

		// Movement handling
		this.$stoppedWalkStep.on(loc => {
			this.$$location.set(loc);
		});
	}

	public get label(): string {
		return `${this.userData.gender === 'm' ? '♂' : '♀'} ${this.userData.firstName}`;
	}
	public get title() {
		return this.job?.label || 'Sitting around…';
	}

	// Calculate a path and emit animations to walk it the whole way. `this.$$location` is updated in between each step
	public walkToTile(destination: TileI) {
		const terrain = destination.terrain;
		if (!terrain) {
			throw new Error(`Entity "${this.id}" is trying to path in a detached coordinate`);
		}
		const start = terrain.getTileClosestToXy(this.$$location.get().x, this.$$location.get().y);
		const path = new Path(terrain, { closest: true }).find(start, destination);

		if (!path.length) {
			Logger.warn('Path was zero steps long, finishing early.');
			// debugger;
			this.$stoppedWalking.emit();
			return;
		}
		const unlisten = this.$stoppedWalkStep.on(() => {
			const nextStep = path.shift();

			if (!nextStep) {
				this.$stoppedWalking.emit();
				unlisten();
			} else {
				this.animateTo(nextStep);
			}
		});

		const next = path.shift();
		if (next) {
			this.animateTo(next);
		}
	}
	/**
	 * Move entity directly to a coordinate. Does not consider accessibility or closeness.
	 */
	private animateTo(coordinate: CoordinateI) {
		if (coordinate.hasNaN()) {
			// @TODO remove or throw
			debugger;
		}
		const distance = this.$$location.get().euclideanDistanceTo(coordinate);

		this.$startedWalking.emit(coordinate, distance / this.walkSpeed);
	}
}
