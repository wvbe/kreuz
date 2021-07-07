import { FunctionComponent, useCallback, useState } from 'react';
import { Path } from '../classes/Path';
import { GenericTile } from '../terrain/GenericTerrain';
import { getRandomFemaleFirstName, getRandomMaleFirstName } from '../constants/names';
import { MovingAnchor } from '../space/Anchor';
import { Event, useEventListeners } from '../util/Event';
import { Entity } from './Entity';

type OnEntityClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => void;

export class PersonEntity extends Entity {
	// The event that the person starts walking a path
	public readonly $startedWalking = new Event<[]>();

	// The event that the person finishes a path, according to react-spring's timing
	public readonly $stoppedWalking = new Event<[]>();

	// The person started one step
	public readonly $startedWalkStep = new Event<[GenericTile]>();

	// The person started finished one step, according to react-spring's timing
	public readonly $stoppedWalkStep = new Event<[GenericTile]>();

	public readonly passport: { firstName: string };

	constructor(id: string, location: GenericTile) {
		super(id, location);

		const feminine = Math.random() < 0.5;
		this.passport = {
			firstName: feminine ? getRandomFemaleFirstName() : getRandomMaleFirstName()
		};

		// Movement handling
		this.$stoppedWalkStep.on(loc => {
			this.location = loc;
		});
	}

	// Calculate a path and emit animations to walk it the whole way. `this.location` is updated in between each step
	public walkTo(destination: GenericTile) {
		if (!this.location.terrain) {
			throw new Error(`Entity "${this.id}" is trying to path in a detached coordinate`);
		}
		const path = new Path(this.location.terrain, { closest: true }).find(
			this.location,
			destination
		);

		// console.log(`${this.location}-->${destination}: ${path.length}`);

		if (!path.length) {
			console.warn('Path was zero steps long, finishing early.', this);
			this.$stoppedWalking.emit();
			return;
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

		this.doPathStep(path.shift() as GenericTile);
	}
	/**
	 * Move entity directly to a coordinate. Does not consider accessibility or closeness.
	 */
	public doPathStep(coordinate: GenericTile) {
		if (coordinate.hasNaN()) {
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

/**
 * A component that automatically transitions the entity component as per its move instructions
 */
export const PersonEntityComponent: FunctionComponent<{
	entity: PersonEntity;
	onClick?: OnEntityClick;
}> = ({ entity, onClick }) => {
	const [{ destination, duration }, animatePosition] = useState({
		destination: entity.location,
		duration: 0
	});

	useEventListeners(
		() => [
			// Listen for the entity moveStart order;
			entity.$startedWalkStep.on(destination =>
				animatePosition({
					destination: destination,
					duration: entity.location.euclideanDistanceTo(destination) * 500
				})
			)
		],
		[entity.$startedWalkStep]
	);

	const onRest = useCallback(
		() => entity.$stoppedWalkStep.emit(destination),
		[entity.$stoppedWalkStep, destination]
	);

	return (
		<MovingAnchor moveTo={destination} moveSpeed={duration} onRest={onRest} onClick={onClick}>
			<entity.Component />
		</MovingAnchor>
	);
};
