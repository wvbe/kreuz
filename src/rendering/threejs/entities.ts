import * as THREE from 'three';
import { Coordinate } from '../../classes/Coordinate';
import { Random } from '../../classes/Random';
import { activePalette } from '../../constants/palettes';
import { BuildingEntity } from '../../entities/BuildingEntity';
import { CivilianEntity } from '../../entities/CivilianPersonEntity';
import { GuardEntity } from '../../entities/GuardPersonEntity';
import { PersonEntity } from '../../entities/PersonEntity';
import { SettlementEntity } from '../../entities/SettlementEntity';
import { TreeEntity } from '../../entities/TreeEntity';
import { RectangleParty } from '../../scenarios/generators/generateRectangles';
import { EntityI, SeedI } from '../../types';
import { convertCoordinate } from './utils';

const MATERIAL_PERSONS = new THREE.MeshBasicMaterial({
	color: activePalette.light
});
const MATERIAL_BUILDINGS = new THREE.MeshBasicMaterial({
	color: activePalette.light
});

function createTreeLikeGeometry(seed: SeedI[], x: number, z: number) {
	const totalHeigt = Random.between(0.8, 1, ...seed, 'a');
	const totalSegments = Math.ceil(Random.between(1.1, 3.9, ...seed, 'b'));
	let lastSegmentBottomRadius = 0;
	let remainingHeight = totalHeigt;
	const geometries = [];
	for (let i = 0; i < totalSegments; i++) {
		const topRadius = lastSegmentBottomRadius * 0.3;
		const segmentHeight = (remainingHeight / (totalSegments - i)) * 0.7;
		const bottomRadius = 0.07 + topRadius * 1.9;
		const geom = new THREE.CylinderGeometry(topRadius, bottomRadius, segmentHeight, 4, 1);
		geom.rotateY(Random.between(-Math.PI, Math.PI, ...seed, i));
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

export type SettlementProperties = {
	areaSize: number;
	minimumBuildingLength: number;
	scale: number;
};
function createSettlementGeometries(seed: SeedI[], props: SettlementProperties) {
	const center = new Coordinate(props.areaSize / 2, props.areaSize / 2, 0);
	const root = RectangleParty.init(seed, props.areaSize, props.areaSize, {
		minimumBuildingLength: props.minimumBuildingLength
	});

	console.log(root);

	return (
		root
			.emit()
			.map(rect => ({
				rect,
				center: new Coordinate(rect.x + rect.w / 2, rect.y + rect.h / 2, 0)
			}))
			.map(obj => ({
				...obj,
				dist: center.euclideanDistanceTo(obj.center)
			}))
			.sort((a, b) => a.dist - b.dist)
			// .slice(0, 10)
			.map(({ rect, center }, i) => {
				let size = (rect.w + rect.h) / 2;

				// Wether this building faces north/south or east/west
				const orientation = Random.boolean([...seed, 'orientation']);
				// Shrink or grow this thing in different places
				const lengthScale = Random.between(0.3, 0.8, ...seed, 'length', 1);
				const widthScale = Random.between(0.3, 0.8, ...seed, 'width', 1);
				const baseHeight = Random.between(0.3 * size, 0.8 * size, ...seed, 'size', i);
				const roofHeight = Random.between(
					0.1 * baseHeight,
					0.4 * baseHeight,
					...seed,
					'roof',
					i
				);

				const geo = createBuildingLikeGeometry(
					(orientation ? rect.w : rect.h) * lengthScale,
					(orientation ? rect.h : rect.w) * widthScale,
					baseHeight,
					roofHeight
				);
				if (orientation) {
					geo.rotateY(Math.PI / 2);
				}

				// Build it more sloppily, rotate a little bit more
				// geo.rotateY(Random.between(-0.4, 0.4, ...seed, 'rotate', i));
				geo.rotateY(Random.between(-Math.PI, Math.PI, ...seed, 'rotate', i));

				const c = convertCoordinate(center);
				const jostle = {
					x: Random.between(props.areaSize / 1.8, props.areaSize / 2.2, ...seed, 'jx', i),
					y: Random.between(props.areaSize / 1.8, props.areaSize / 2.2, ...seed, 'jy', i)
				};
				geo.translate(c.x - jostle.x, c.y, c.z - jostle.y);
				geo.scale(props.scale, props.scale, props.scale);
				return geo;
			})
	);
}

export function createEntityObject(entity: EntityI) {
	const group = new THREE.Group();
	const seed = [entity.id];

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
		if (entity instanceof SettlementEntity) {
			return createSettlementGeometries(seed, entity.userData);
		}
		if (entity instanceof TreeEntity) {
			return Random.poisson(1, 1, 0.25, entity.id).reduce<THREE.CylinderGeometry[]>(
				(flat, [x, y]) => [...flat, ...createTreeLikeGeometry([...seed, x, y], x, y)],
				[]
			);
		}
	})();
	const material = entity instanceof PersonEntity ? MATERIAL_PERSONS : MATERIAL_BUILDINGS;

	(Array.isArray(geometry) ? geometry : [geometry]).forEach(geo => {
		const mesh = new THREE.Mesh(geo, material);
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
