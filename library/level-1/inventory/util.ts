import { type Material } from './Material.ts';
import * as materials from './materials.ts';

const materialMap = Object.entries(materials).reduce<Map<Material, string>>((map, [key, value]) => {
	map.set(value, key);
	return map;
}, new Map());

export function getIdForMaterial(material: Material): string {
	const mat = materialMap.get(material);
	if (!mat) {
		throw new Error(`Unknown material "${material}"`);
	}
	return mat;
}
export function getMaterialForId(id: string): Material {
	const mat = (materials as Record<string, Material>)[id];
	if (!mat) {
		throw new Error(`Unknown material ID "${id}"`);
	}
	return mat;
}
