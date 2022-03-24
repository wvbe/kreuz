import * as THREE from 'three';

export function convertCoordinate(coord: { x: number; y: number; z: number }) {
	return new THREE.Vector3(coord.x, coord.z, coord.y);
}
