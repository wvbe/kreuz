import * as THREE from 'three';
import { activePalette } from './palettes';

export const MATERIAL_PERSONS = new THREE.MeshBasicMaterial({
	color: activePalette.light
});
export const MATERIAL_BUILDINGS = new THREE.MeshBasicMaterial({
	color: activePalette.light
});

export const MATERIAL_LINES = new THREE.LineBasicMaterial({
	color: activePalette.darkest,
	linewidth: 1
});
