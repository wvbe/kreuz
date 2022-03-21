import * as THREE from 'three';
import { CoordinateI, EntityI } from '../types';
import { Entity } from './Entity';

export type BuildingParameters = {
	baseWidth: number;
	baseDepth: number;
	baseHeight: number;
	roofHeight: number;
};

/**
 * @deprecated Should probably use settlement entity instead
 */
export class BuildingEntity extends Entity implements EntityI {
	/**
	 * @deprecated not used yet.
	 */
	public type = 'buiding';
	protected readonly parameters: BuildingParameters;

	constructor(id: string, location: CoordinateI, parameters: BuildingParameters) {
		super(id, location);
		this.parameters = parameters;
	}

	public get label(): string {
		return this.id;
	}

	protected createGeometries() {
		return [BuildingEntity.createGeometry(this.parameters)];
	}

	/**
	 * Exposed to SettlementEntity
	 */
	public static createGeometry(parameters: BuildingParameters) {
		const { baseWidth, baseHeight, baseDepth, roofHeight } = parameters;
		const shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, baseHeight);
		shape.lineTo(baseWidth / 2, baseHeight + roofHeight);
		shape.lineTo(baseWidth, baseHeight);
		shape.lineTo(baseWidth, 0);
		shape.lineTo(0, 0);
		const geo = new THREE.ExtrudeGeometry(shape, {
			steps: 1,
			depth: baseDepth,
			bevelEnabled: false
		});
		geo.translate(-baseWidth / 2, 0, -baseDepth / 2);
		return geo;
	}
}
