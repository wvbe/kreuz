import { EntityPersonI } from './types.ts';
import { PersonEntity } from './PersonEntity.ts';

export class CivilianPersonEntity extends PersonEntity implements EntityPersonI {
	public type = 'civilian';
	// protected createGeometries() {
	// 	const geo = new THREE.TetrahedronGeometry(0.2);
	// 	geo.translate(0, 0.12, 0);
	// 	return geo;
	// }
}
