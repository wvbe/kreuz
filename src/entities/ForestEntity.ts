import { EntityI } from './types.ts';
import { Entity } from './Entity.ts';

export class ForestEntity extends Entity implements EntityI {
	/**
	 * @deprecated not used yet.
	 */
	public type = 'forest';
	public get label(): string {
		return 'Tree';
	}
	public get title(): string {
		return 'Sucking moisture';
	}

	// private createSingleTreeGeometry(w: number, h: number, x: number, y: number) {
	// 	const seed = [this.id, 'tree', x, y];
	// 	const totalHeigt = Random.between(0.8, 1, ...seed, 'a');
	// 	const totalSegments = Math.ceil(Random.between(1.1, 3.9, ...seed, 'b'));
	// 	let lastSegmentBottomRadius = 0;
	// 	let remainingHeight = totalHeigt;
	// 	const geometries = [];
	// 	for (let i = 0; i < totalSegments; i++) {
	// 		const topRadius = lastSegmentBottomRadius * 0.3;
	// 		const segmentHeight = (remainingHeight / (totalSegments - i)) * 0.7;
	// 		const bottomRadius = 0.07 + topRadius * 1.9;
	// 		const geom = new THREE.CylinderGeometry(topRadius, bottomRadius, segmentHeight, 4, 1);
	// 		geom.rotateY(Random.between(-Math.PI, Math.PI, ...seed, i));
	// 		geom.translate(x - w / 2, remainingHeight * 0.8, y - h / 2);
	// 		geometries.push(geom);
	// 		remainingHeight -= segmentHeight;
	// 		lastSegmentBottomRadius = bottomRadius;
	// 	}
	// 	const trunk = new THREE.CylinderGeometry(0.01, 0.01, totalHeigt * 0.6, 3);
	// 	trunk.translate(x - w / 2, totalHeigt * 0.6 * 0.5, y - h / 2);
	// 	geometries.push(trunk);

	// 	return geometries;
	// }

	// protected createGeometries() {
	// 	const w = 1,
	// 		h = 1;
	// 	return Random.poisson(w, h, 0.25, this.id).reduce<GeometryI[]>(
	// 		(flat, [x, y]) => [...flat, ...this.createSingleTreeGeometry(w, h, x, y)],
	// 		[],
	// 	);
	// }
}
