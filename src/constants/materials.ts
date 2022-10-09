import * as THREE from 'three';
import { activePalette } from './palettes.ts';

export const MATERIAL_PERSONS = new THREE.MeshLambertMaterial({
	color: activePalette.light,
});
export const MATERIAL_BUILDINGS = new THREE.MeshLambertMaterial({
	color: activePalette.light,
});

export const MATERIAL_LINES = new THREE.LineBasicMaterial({
	color: activePalette.darkest,
	linewidth: 1,
});

export const MATERIAL_TERRAIN = new THREE.MeshLambertMaterial({
	color: activePalette.medium,
	// wireframe: true
});
