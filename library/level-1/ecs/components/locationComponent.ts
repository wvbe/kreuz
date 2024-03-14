import { EventedValue } from '../../events/EventedValue.ts';
import { Coordinate } from '../../terrain/Coordinate.ts';
import { CoordinateI } from '../../types.ts';
import { EcsComponent } from '../classes/EcsComponent.ts';

export const locationComponent = new EcsComponent<
	{ location: [number, number, number] },
	{ $$location: EventedValue<CoordinateI> }
>(
	(entity) => entity.$$location instanceof EventedValue,
	(entity, options) => {
		Object.assign(entity, {
			$$location: new EventedValue(
				new Coordinate(...options.location),
				'locationComponent $$location',
			),
		});
	},
);
