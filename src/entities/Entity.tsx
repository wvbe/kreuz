import { FunctionComponent, useCallback, useState } from 'react';
import { Path } from '../classes/Path';
import { TerrainCoordinate } from '../classes/TerrainCoordinate';
import { Job } from '../jobs/Patrol';
import { MovingAnchor } from '../space/Anchor';
import { Event, useEventListeners } from '../util/events';
const noop = () => {};

type OnEntityClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
export class Entity {
	public readonly id: string;

	public readonly pathStart = new Event<[]>();
	public readonly pathEnd = new Event<[]>();

	/**
	 * The event that an entity was instructed to moveTo()
	 */
	public readonly pathStepStart = new Event<[TerrainCoordinate]>();

	/**
	 * The event that this entity has completed a moveTo(), according to react-spring's timing
	 */
	public readonly pathStepEnd = new Event<[TerrainCoordinate]>();

	/**
	 * The React SVG component that consitutes this entity. Is expected to be defined in a class
	 * that extends `Entity`.
	 */
	public readonly Component: FunctionComponent = () => {
		return null;
	};

	public location: TerrainCoordinate;

	/**
	 * The set of behaviour/tasks given to this entity.
	 */
	public job?: Job;

	constructor(id: string, location: TerrainCoordinate) {
		this.id = id;
		this.location = location;

		// Movement handling
		this.pathStepEnd.on(loc => {
			this.location = loc;
		});
	}

	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}

	public play() {
		return this.job?.start() || noop;
	}

	public doJob(job: Job) {
		this.job = job;

		// @TODO maybe some events
	}

	public walkTo(destination: TerrainCoordinate) {
		if (!this.location.terrain) {
			throw new Error(`Entity "${this.id}" is trying to path in a detached coordinate`);
		}
		const path = new Path(this.location.terrain, { closest: true }).find(
			this.location,
			destination
		);
		if (!path.length) {
			return;
		}
		let unlisten = this.pathStepEnd.on(() => {
			const nextStep = path.shift();

			if (!nextStep) {
				unlisten();
				this.pathEnd.emit();
			} else {
				this.doPathStep(nextStep);
			}
		});
		this.doPathStep(path.shift() as TerrainCoordinate);
	}
	/**
	 * Move entity directly to a coordinate. Does not consider accessibility or closeness.
	 */
	public doPathStep(coordinate: TerrainCoordinate) {
		if (coordinate.hasNaN()) {
			debugger;
		}
		this.pathStepStart.emit(coordinate);
	}
}

/**
 * A component that automatically transitions the entity component as per its move instructions
 */
export const EntityComponent: FunctionComponent<{ entity: Entity; onClick?: OnEntityClick }> = ({
	entity,
	onClick
}) => {
	const [{ destination, duration }, animatePosition] = useState({
		destination: entity.location,
		duration: 0
	});

	useEventListeners(
		() => [
			// Listen for the entity moveStart order;
			entity.pathStepStart.on(destination =>
				animatePosition({
					destination,
					duration: entity.location.euclideanDistanceTo(destination) * 200
				})
			)
		],
		[entity.pathStepStart]
	);

	const onRest = useCallback(
		() => entity.pathStepEnd.emit(destination),
		[entity.pathStepEnd, destination]
	);

	return (
		<MovingAnchor moveTo={destination} moveSpeed={duration} onRest={onRest} onClick={onClick}>
			<entity.Component />
		</MovingAnchor>
	);
};
