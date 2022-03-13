import * as THREE from 'three';
import { activePalette } from '../../constants/palettes';
import { BuildingEntity } from '../../entities/BuildingEntity';
import { CivilianEntity } from '../../entities/CivilianPersonEntity';
import { GuardEntity } from '../../entities/GuardPersonEntity';
import { TreeEntity } from '../../entities/TreeEntity';
import { EntityI } from '../../types';

const MATERIAL_MESH = new THREE.MeshBasicMaterial({
	color: activePalette.light
});

function createTreeLikeGeometry(x: number, z: number) {
	const totalHeigt = 0.8 + Math.random() * 0.2;
	const totalSegments = 1 + Math.ceil(Math.random() * 3);
	let lastSegmentBottomRadius = 0;
	let remainingHeight = totalHeigt;
	const geometries = [];
	for (let i = 0; i < totalSegments; i++) {
		const topRadius = lastSegmentBottomRadius * 0.3;
		const segmentHeight = (remainingHeight / (totalSegments - i)) * 0.7;
		const bottomRadius = 0.07 + topRadius * 1.9;
		const geom = new THREE.CylinderGeometry(topRadius, bottomRadius, segmentHeight, 4, 1);
		geom.rotateY((Math.random() * 2 * Math.PI) / 4);
		geom.translate(x, remainingHeight * 0.8, z);
		geometries.push(geom);
		remainingHeight -= segmentHeight;
		lastSegmentBottomRadius = bottomRadius;
	}
	const trunk = new THREE.CylinderGeometry(0.01, 0.01, totalHeigt * 0.6, 3);
	trunk.translate(x, totalHeigt * 0.6 * 0.5, z);
	geometries.push(trunk);

	return geometries;
}
function createBuildingLikeGeometry(
	baseWidth: number,
	baseDepth: number,
	baseHeight: number,
	roofHeight: number
) {
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

export function createEntityObject(entity: EntityI) {
	const group = new THREE.Group();

	// const location = Coordinate.clone(entity.location).transform(0, 0, 0.175);
	const geometry = (() => {
		if (entity instanceof GuardEntity) {
			const geo = new THREE.IcosahedronGeometry(0.2);
			geo.translate(0, 0.18, 0);
			return geo;
		}
		if (entity instanceof CivilianEntity) {
			const geo = new THREE.TetrahedronGeometry(0.2);
			geo.translate(0, 0.12, 0);
			return geo;
		}
		if (entity instanceof BuildingEntity) {
			return createBuildingLikeGeometry(0.5, 0.6, 0.4, 0.2);
		}
		if (entity instanceof TreeEntity) {
			return Array.from(new Array(5)).reduce(
				flat => [
					...flat,
					...createTreeLikeGeometry(-0.5 + Math.random(), -0.5 + Math.random())
				],
				[]
			);
		}
	})();

	(Array.isArray(geometry) ? geometry : [geometry]).forEach(geo => {
		const mesh = new THREE.Mesh(geo, MATERIAL_MESH);
		// mesh.position.copy(convertCoordinate(location));
		mesh.userData.entity = entity;
		group.add(mesh);

		const edges = new THREE.EdgesGeometry(geo);
		const line = new THREE.LineSegments(
			edges,
			new THREE.LineBasicMaterial({
				color: activePalette.darkest,
				linewidth: 1
			})
		);
		// line.position.copy(convertCoordinate(location));
		group.add(line);
	});

	return group;
}
