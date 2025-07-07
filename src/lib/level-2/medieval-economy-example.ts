/**
 * Medieval Economy System - Usage Examples
 *
 * This file demonstrates how to use the medieval economy system
 * with practical examples of production chains and economic relationships.
 */

import {
	getProductionChain,
	getProductsFromMaterial,
	INTERMEDIARY_PRODUCTS,
	PRODUCTION_FACILITIES,
	PRODUCTION_TOOLS,
	RAW_MATERIALS,
	TRADE_RELATIONSHIPS,
} from './medieval-economy';

// Example 1: What can we make from wheat?
console.log('=== What can we make from wheat? ===');
const wheatProducts = getProductsFromMaterial('wheat');
console.log('Direct products from wheat:', wheatProducts);

// Example 2: Complete production chain for bread
console.log('\n=== Complete production chain for bread ===');
const breadChain = getProductionChain('bread');
console.log('Bread production chain:', breadChain);

// Example 3: Economic interconnectedness - Iron
console.log("\n=== Iron's role in the economy ===");
console.log('Iron ore → Iron ingot → Multiple products:');
const ironProducts = getProductsFromMaterial('iron_ingot');
console.log('Products using iron ingots:', ironProducts);

// Example 4: Multi-use raw materials
console.log('\n=== Multi-use raw materials ===');
const versatileMaterials = ['wood', 'iron_ingot', 'clay'];
versatileMaterials.forEach((material) => {
	const products = getProductsFromMaterial(material);
	console.log(`${material} is used in: ${products.join(', ')}`);
});

// Example 5: Production facility requirements with tools
console.log('\n=== Production facility tool requirements ===');
Object.entries(PRODUCTION_FACILITIES).forEach(([key, facility]) => {
	console.log(`${facility.name}: requires ${facility.requiredTools.join(', ')}`);
});

// Example 6: Production tool chains
console.log('\n=== Production tool manufacturing chains ===');
const keyTools = ['anvil', 'bread_oven', 'loom_frame'];
keyTools.forEach((tool) => {
	const chain = getProductionChain(tool);
	console.log(`${tool} production chain: ${chain.join(' → ')}`);
});

// Example 7: Luxury tiers and market competition
console.log('\n=== Market competition analysis ===');
Object.entries(TRADE_RELATIONSHIPS.competitors).forEach(([market, products]) => {
	console.log(`${market} market: ${products.join(' vs ')}`);
});

// Example 8: Supply chain analysis
console.log('\n=== Supply chain analysis ===');
function analyzeSupplyChain(product: string) {
	const chain = getProductionChain(product);
	const rawMaterials = chain.filter((item) => RAW_MATERIALS[item as keyof typeof RAW_MATERIALS]);
	const tools = chain.filter((item) => PRODUCTION_TOOLS[item as keyof typeof PRODUCTION_TOOLS]);
	const intermediaryProducts = chain.filter(
		(item) => INTERMEDIARY_PRODUCTS[item as keyof typeof INTERMEDIARY_PRODUCTS],
	);

	console.log(`${product} supply chain:`);
	console.log(`  Raw materials needed: ${rawMaterials.join(', ')}`);
	console.log(`  Tools needed: ${tools.join(', ')}`);
	console.log(`  Intermediary products: ${intermediaryProducts.join(', ')}`);
	console.log(`  Chain complexity: ${chain.length} steps`);
}

analyzeSupplyChain('fine_cloth');
analyzeSupplyChain('jewelry');
analyzeSupplyChain('weapons');

// Example 9: Facility setup cost analysis
console.log('\n=== Facility setup cost analysis ===');
function calculateFacilitySetupCost(facilityKey: string): Record<string, number> {
	const facility = PRODUCTION_FACILITIES[facilityKey as keyof typeof PRODUCTION_FACILITIES];
	if (!facility) return {};

	const totalCosts: Record<string, number> = {};

	// Calculate cost for each required tool
	facility.requiredTools.forEach((toolKey) => {
		const tool = PRODUCTION_TOOLS[toolKey as keyof typeof PRODUCTION_TOOLS];
		if (tool) {
			(tool.inputs as readonly string[]).forEach((input) => {
				totalCosts[input] = (totalCosts[input] || 0) + 1;
			});
		}
	});

	return totalCosts;
}

const facilitySetupCosts = calculateFacilitySetupCost('bakery');
console.log('Bakery setup costs:', facilitySetupCosts);

// Example 10: Economic simulation helpers
export function calculateProductionCost(
	product: string,
	baseCosts: Record<string, number>,
): number {
	const chain = getProductionChain(product);
	let totalCost = 0;

	chain.forEach((item) => {
		if (baseCosts[item]) {
			totalCost += baseCosts[item];
		}
	});

	return totalCost;
}

export function findAlternativeSuppliers(material: string): string[] {
	const alternatives: string[] = [];

	// Check if material has substitutes
	Object.entries(TRADE_RELATIONSHIPS.substitutes).forEach(([category, items]) => {
		if (items.includes(material)) {
			alternatives.push(...items.filter((item) => item !== material));
		}
	});

	return alternatives;
}

// Example usage of helper functions
console.log('\n=== Economic simulation examples ===');

// Mock base costs for demonstration
const baseCosts = {
	wheat: 1,
	barley: 1,
	cattle: 10,
	sheep: 5,
	flour: 2,
	malt: 2,
	beef: 15,
	wool: 3,
	bread: 5,
	ale: 8,
	cloth: 12,
	iron_ingot: 5,
	wood: 2,
	stone: 3,
	anvil: 50,
	bread_oven: 30,
	loom_frame: 25,
};

console.log('Production cost for bread:', calculateProductionCost('bread', baseCosts));
console.log('Alternative suppliers for wheat:', findAlternativeSuppliers('wheat'));

// Example 11: Seasonal production planning
export function getSeasonalProducts(): string[] {
	const seasonal: string[] = [];

	Object.entries(RAW_MATERIALS).forEach(([key, material]) => {
		if ('seasonalBonus' in material && material.seasonalBonus) {
			seasonal.push(key);
		}
	});

	return seasonal;
}

console.log('\n=== Seasonal production planning ===');
console.log('Seasonal products:', getSeasonalProducts());

// Example 12: Resource scarcity simulation
export function analyzeResourceScarcity(): Record<string, string[]> {
	const scarcityAnalysis: Record<string, string[]> = {
		finite: [],
		renewable: [],
		byproducts: [],
	};

	Object.entries(RAW_MATERIALS).forEach(([key, material]) => {
		if ('finite' in material && material.finite) {
			scarcityAnalysis.finite.push(key);
		} else if ('byproduct' in material && material.byproduct) {
			scarcityAnalysis.byproducts.push(key);
		} else {
			scarcityAnalysis.renewable.push(key);
		}
	});

	return scarcityAnalysis;
}

console.log('\n=== Resource scarcity analysis ===');
const scarcityData = analyzeResourceScarcity();
console.log('Finite resources (will run out):', scarcityData.finite);
console.log('Renewable resources:', scarcityData.renewable);
console.log('Byproducts (depend on other production):', scarcityData.byproducts);

// Example 13: Tool durability and maintenance
export function calculateToolMaintenanceCost(
	facilityKey: string,
	usageHours: number,
): Record<string, number> {
	const facility = PRODUCTION_FACILITIES[facilityKey as keyof typeof PRODUCTION_FACILITIES];
	if (!facility) return {};

	const maintenanceCosts: Record<string, number> = {};

	facility.requiredTools.forEach((toolKey) => {
		const tool = PRODUCTION_TOOLS[toolKey as keyof typeof PRODUCTION_TOOLS];
		if (tool && tool.durability) {
			const wearRate = usageHours / tool.durability;
			if (wearRate > 0.1) {
				// Needs maintenance if more than 10% worn
				maintenanceCosts[toolKey] = Math.ceil(wearRate * 10); // Maintenance cost
			}
		}
	});

	return maintenanceCosts;
}

console.log('\n=== Tool maintenance analysis ===');
const maintenanceCosts = calculateToolMaintenanceCost('smithy', 500);
console.log('Smithy maintenance costs after 500 hours:', maintenanceCosts);
