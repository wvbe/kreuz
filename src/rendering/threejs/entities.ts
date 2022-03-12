import * as THREE from 'three';
import { activePalette } from '../../constants/palettes';
import { BuildingEntity } from '../../entities/BuildingEntity';
import { CivilianEntity } from '../../entities/CivilianPersonEntity';
import { GuardEntity } from '../../entities/GuardPersonEntity';
import { EntityI } from '../../types';

const MATERIAL_MESH = new THREE.MeshBasicMaterial({
	color: activePalette.light
});

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
	})();

	const mesh = new THREE.Mesh(geometry, MATERIAL_MESH);
	// mesh.position.copy(convertCoordinate(location));
	mesh.userData.entity = entity;
	group.add(mesh);

	const edges = new THREE.EdgesGeometry(geometry);
	const line = new THREE.LineSegments(
		edges,
		new THREE.LineBasicMaterial({
			color: activePalette.darkest,
			linewidth: 1
		})
	);
	// line.position.copy(convertCoordinate(location));
	group.add(line);

	return group;
}
