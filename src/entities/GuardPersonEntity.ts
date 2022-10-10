import * as THREE from 'three';
import { EntityPersonI } from '../types.ts';
import { PersonEntity } from './PersonEntity.ts';

export class GuardPersonEntity extends PersonEntity implements EntityPersonI {
	/**
	 * @deprecated not used yet.
	 */
	public type = 'guard';
	public get label(): string {
		const title = this.userData.gender === 'm' ? `Guardsman` : `Guardswoman`;
		return `${title} ${this.userData.firstName}`;
	}

	protected createGeometries() {
		const geo = new THREE.IcosahedronGeometry(0.2);
		geo.translate(0, 0.18, 0);
		return geo;
	}
}
