import * as THREE from 'three';
import { EntityPersonI } from '../types';
import { PersonEntity } from './PersonEntity';

export class GuardEntity extends PersonEntity implements EntityPersonI {
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
