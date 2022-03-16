import * as THREE from 'three';
import { EntityPersonI } from '../types';
import { PersonEntity } from './PersonEntity';

export class CivilianEntity extends PersonEntity implements EntityPersonI {
	protected createGeometries() {
		const geo = new THREE.TetrahedronGeometry(0.2);
		geo.translate(0, 0.12, 0);
		return geo;
	}
}
