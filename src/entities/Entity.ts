import { Coordinate } from '../classes/Coordinate.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';
import { type JobI } from '../jobs/types.ts';
import { type SaveEntityJson } from '../types-savedgame.ts';
import { type CoordinateI } from '../types.ts';
import { type EntityI } from './types.ts';
const noop = () => {};

export class Entity implements EntityI {
	public readonly id: string;

	public $$location: EventedValue<CoordinateI>;

	/**
	 * Used for generating a save
	 */
	public type = 'entity';

	/**
	 * The set of behaviour/tasks given to this entity.
	 */
	public job?: JobI;

	constructor(id: string, location: CoordinateI) {
		this.id = id;
		this.$$location = new EventedValue(Coordinate.clone(location), 'Entity#$$location');
	}

	public get label(): string {
		return `${this.constructor.name} ${this.id}`;
	}
	public get title(): string {
		return 'Not doing anything';
	}

	toString() {
		return this.label;
	}

	public attach(game: Game): void {
		// @TODO unregister/detach!
		game.$start.on(() => {
			this.job?.start(game) || noop;
		});
	}

	public doJob(job: JobI) {
		this.job = job;

		// @TODO maybe some events
	}

	public destroy() {
		this.job?.destroy();
	}

	// protected createGeometries(): GeometryI | GeometryI[] {
	// 	throw new Error('Not implemented');
	// }

	// public createObject(material = MATERIAL_PERSONS) {
	// 	const _geometries = this.createGeometries(),
	// 		geometries = Array.isArray(_geometries) ? _geometries : [_geometries];

	// 	const group = new THREE.Group();
	// 	geometries.forEach((geo) => {
	// 		const mesh = new THREE.Mesh(geo, material);
	// 		mesh.userData.entity = this;
	// 		group.add(mesh);
	// 		const edges = new THREE.EdgesGeometry(geo);
	// 		const line = new THREE.LineSegments(edges, MATERIAL_LINES);
	// 		group.add(line);
	// 	});

	// 	return group;
	// }

	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveEntityJson {
		return {
			type: this.type,
			id: this.id,
			location: this.$$location.get().toArray(),
		};
	}
}
