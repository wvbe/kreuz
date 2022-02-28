import React, { FunctionComponent } from 'react';
import { Path } from '../classes/Path';
import { getRandomFemaleFirstName, getRandomMaleFirstName } from '../constants/names';
import { EntityPersonI, TileI } from '../types';
import { Event } from '../classes/Event';
import { Entity } from './Entity';
import Logger from '../classes/Logger';

export class PersonEntity extends Entity implements EntityPersonI {
	// The event that the person finishes a path, according to react-spring's timing
	public readonly $stoppedWalking = new Event<[]>();

	// The person started one step
	public readonly $startedWalkStep = new Event<[TileI]>();

	// The person started finished one step, according to react-spring's timing
	public readonly $stoppedWalkStep = new Event<[TileI]>();

	protected readonly passport: { firstName: string };

	constructor(
		id: string,
		location: TileI,
		passport = {
			firstName: Math.random() < 0.5 ? getRandomFemaleFirstName() : getRandomMaleFirstName()
		}
	) {
		super(id, location);
		this.passport = passport;

		// Movement handling
		this.$stoppedWalkStep.on(loc => {
			this.location = loc;
		});
	}

	// Calculate a path and emit animations to walk it the whole way. `this.location` is updated in between each step
	public walkTo(destination: TileI) {
		if (!this.location.terrain) {
			throw new Error(`Entity "${this.id}" is trying to path in a detached coordinate`);
		}
		const path = new Path(this.location.terrain, { closest: true }).find(
			this.location,
			destination
		);

		Logger.log(`${this.location}-->${destination}: ${path.length}`);

		if (!path.length) {
			// This should never happen, even if it is harmless.
			//   this.$stoppedWalking.emit();
			//   return;

			throw new Error('Path was zero steps long, finishing early.');
		}
		const unlisten = this.$stoppedWalkStep.on(() => {
			const nextStep = path.shift();

			if (!nextStep) {
				this.$stoppedWalking.emit();
				unlisten();
			} else {
				this.doPathStep(nextStep);
			}
		});

		this.doPathStep(path.shift() as TileI);
	}
	/**
	 * Move entity directly to a coordinate. Does not consider accessibility or closeness.
	 */
	private doPathStep(coordinate: TileI) {
		if (coordinate.hasNaN()) {
			// @TODO remove or throw
			debugger;
		}
		this.$startedWalkStep.emit(coordinate);
	}

	public get label(): string {
		return this.passport.firstName;
	}

	Component: FunctionComponent = () => {
		return <circle cx={0} cy={0} r="5" fill="white" stroke="black" />;
	};
}
