/**
 * Medieval Economy System
 *
 * This file defines the complete production chains for a medieval economy-based game.
 * It includes raw materials, intermediary products, final products, and the tools/furniture
 * needed for production. The system is designed to be interconnected, where most materials
 * can be used in multiple production chains.
 */

// ===== RAW MATERIALS =====
export const RAW_MATERIALS = {
	// Agricultural
	wheat: { name: 'Wheat', category: 'grain', harvestTime: 90 },
	barley: { name: 'Barley', category: 'grain', harvestTime: 85 },
	oats: { name: 'Oats', category: 'grain', harvestTime: 80 },
	rye: { name: 'Rye', category: 'grain', harvestTime: 95 },
	grapes: { name: 'Grapes', category: 'fruit', harvestTime: 120 },
	hops: { name: 'Hops', category: 'herb', harvestTime: 100 },
	flax: { name: 'Flax', category: 'fiber', harvestTime: 70 },

	// Livestock & Animal Products
	cattle: { name: 'Cattle', category: 'livestock', maturityTime: 365 },
	sheep: { name: 'Sheep', category: 'livestock', maturityTime: 180 },
	pigs: { name: 'Pigs', category: 'livestock', maturityTime: 200 },
	goats: { name: 'Goats', category: 'livestock', maturityTime: 150 },
	chickens: { name: 'Chickens', category: 'poultry', maturityTime: 60 },

	// Natural Resources
	wood: { name: 'Wood', category: 'material', renewalTime: 1460 }, // 4 years
	stone: { name: 'Stone', category: 'material', finite: true },
	clay: { name: 'Clay', category: 'material', finite: false },
	sand: { name: 'Sand', category: 'material', finite: false },
	salt: { name: 'Salt', category: 'mineral', finite: true },
	iron_ore: { name: 'Iron Ore', category: 'mineral', finite: true },
	copper_ore: { name: 'Copper Ore', category: 'mineral', finite: true },
	silver_ore: { name: 'Silver Ore', category: 'mineral', finite: true },
	gold_ore: { name: 'Gold Ore', category: 'mineral', finite: true },

	// Miscellaneous
	honey: { name: 'Honey', category: 'sweetener', seasonalBonus: true },
	beeswax: { name: 'Beeswax', category: 'material', seasonalBonus: true },
	tallow: { name: 'Tallow', category: 'fat', byproduct: true },
} as const;

// ===== INTERMEDIARY PRODUCTS =====
export const INTERMEDIARY_PRODUCTS = {
	// Food Processing
	flour: { name: 'Flour', inputs: ['wheat', 'barley', 'oats', 'rye'], processingTime: 5 },
	malt: { name: 'Malt', inputs: ['barley', 'wheat'], processingTime: 15 },
	milk: { name: 'Milk', inputs: ['cattle', 'goats'], renewable: true },
	butter: { name: 'Butter', inputs: ['milk'], processingTime: 10 },
	eggs: { name: 'Eggs', inputs: ['chickens'], renewable: true },

	// Meat Processing
	beef: { name: 'Beef', inputs: ['cattle'], processingTime: 30 },
	pork: { name: 'Pork', inputs: ['pigs'], processingTime: 25 },
	mutton: { name: 'Mutton', inputs: ['sheep'], processingTime: 20 },
	poultry: { name: 'Poultry', inputs: ['chickens'], processingTime: 5 },

	// Materials Processing
	wool: { name: 'Wool', inputs: ['sheep'], renewable: true },
	hide: { name: 'Hide', inputs: ['cattle', 'sheep', 'pigs'], byproduct: true },
	leather: { name: 'Leather', inputs: ['hide'], processingTime: 45 },
	thread: { name: 'Thread', inputs: ['wool', 'flax'], processingTime: 8 },
	yarn: { name: 'Yarn', inputs: ['wool'], processingTime: 12 },

	// Metalworking
	iron_ingot: { name: 'Iron Ingot', inputs: ['iron_ore'], processingTime: 20 },
	copper_ingot: { name: 'Copper Ingot', inputs: ['copper_ore'], processingTime: 15 },
	bronze_ingot: { name: 'Bronze Ingot', inputs: ['copper_ingot', 'tin_ore'], processingTime: 25 },
	silver_ingot: { name: 'Silver Ingot', inputs: ['silver_ore'], processingTime: 30 },
	gold_ingot: { name: 'Gold Ingot', inputs: ['gold_ore'], processingTime: 40 },

	// Construction Materials
	planks: { name: 'Planks', inputs: ['wood'], processingTime: 10 },
	boards: { name: 'Boards', inputs: ['wood'], processingTime: 8 },
	shingles: { name: 'Shingles', inputs: ['wood'], processingTime: 15 },
	bricks: { name: 'Bricks', inputs: ['clay'], processingTime: 20 },
	mortar: { name: 'Mortar', inputs: ['sand', 'stone'], processingTime: 5 },

	// Pottery & Ceramics
	pottery: { name: 'Pottery', inputs: ['clay'], processingTime: 25 },
	glazed_pottery: { name: 'Glazed Pottery', inputs: ['pottery', 'ash'], processingTime: 35 },

	// Other Materials
	candles: { name: 'Candles', inputs: ['tallow', 'beeswax'], processingTime: 12 },
	soap: { name: 'Soap', inputs: ['tallow', 'ash'], processingTime: 18 },
	dye: { name: 'Dye', inputs: ['berries', 'herbs'], processingTime: 20 },
} as const;

// ===== FINAL PRODUCTS =====
export const FINAL_PRODUCTS = {
	// Food
	bread: {
		name: 'Bread',
		category: 'food',
		inputs: ['flour', 'salt', 'honey'],
		processingTime: 8,
		needsSatisfied: ['hunger'],
		shelfLife: 3,
	},
	cheese: {
		name: 'Cheese',
		category: 'food',
		inputs: ['milk', 'salt'],
		processingTime: 30,
		needsSatisfied: ['hunger'],
		shelfLife: 20,
	},
	meat_pie: {
		name: 'Meat Pie',
		category: 'food',
		inputs: ['flour', 'beef', 'butter'],
		processingTime: 15,
		needsSatisfied: ['hunger'],
		shelfLife: 2,
	},
	roasted_meat: {
		name: 'Roasted Meat',
		category: 'food',
		inputs: ['beef', 'pork', 'mutton', 'poultry'],
		processingTime: 12,
		needsSatisfied: ['hunger'],
		shelfLife: 1,
	},

	// Beverages
	ale: {
		name: 'Ale',
		category: 'drink',
		inputs: ['malt', 'hops'],
		processingTime: 60,
		needsSatisfied: ['thirst', 'comfort'],
		shelfLife: 30,
	},
	wine: {
		name: 'Wine',
		category: 'drink',
		inputs: ['grapes'],
		processingTime: 120,
		needsSatisfied: ['thirst', 'luxury'],
		shelfLife: 365,
	},
	mead: {
		name: 'Mead',
		category: 'drink',
		inputs: ['honey'],
		processingTime: 90,
		needsSatisfied: ['thirst', 'luxury'],
		shelfLife: 180,
	},

	// Textiles & Clothing
	cloth: {
		name: 'Cloth',
		category: 'textile',
		inputs: ['thread'],
		processingTime: 25,
		needsSatisfied: ['warmth'],
		durability: 200,
	},
	fine_cloth: {
		name: 'Fine Cloth',
		category: 'textile',
		inputs: ['thread', 'dye'],
		processingTime: 40,
		needsSatisfied: ['warmth', 'luxury'],
		durability: 300,
	},
	leather_armor: {
		name: 'Leather Armor',
		category: 'armor',
		inputs: ['leather'],
		processingTime: 50,
		needsSatisfied: ['protection'],
		durability: 500,
	},

	// Tools & Weapons
	iron_tools: {
		name: 'Iron Tools',
		category: 'tools',
		inputs: ['iron_ingot', 'wood'],
		processingTime: 30,
		needsSatisfied: ['efficiency'],
		durability: 800,
	},
	weapons: {
		name: 'Weapons',
		category: 'weapons',
		inputs: ['iron_ingot', 'wood'],
		processingTime: 45,
		needsSatisfied: ['protection'],
		durability: 600,
	},

	// Furniture & Luxury Items
	wooden_furniture: {
		name: 'Wooden Furniture',
		category: 'furniture',
		inputs: ['planks', 'iron_ingot'],
		processingTime: 80,
		needsSatisfied: ['comfort'],
		durability: 1000,
	},
	jewelry: {
		name: 'Jewelry',
		category: 'luxury',
		inputs: ['gold_ingot', 'silver_ingot'],
		processingTime: 60,
		needsSatisfied: ['luxury'],
		durability: 2000,
	},
	pottery_vessels: {
		name: 'Pottery Vessels',
		category: 'tools',
		inputs: ['glazed_pottery'],
		processingTime: 35,
		needsSatisfied: ['storage'],
		durability: 400,
	},

	// Construction & Building
	building_materials: {
		name: 'Building Materials',
		category: 'construction',
		inputs: ['planks', 'bricks', 'mortar'],
		processingTime: 20,
		needsSatisfied: ['shelter'],
		durability: 5000,
	},
} as const;

// ===== PRODUCTION TOOLS =====
export const PRODUCTION_TOOLS = {
	// Milling Tools
	millstones: {
		name: 'Millstones',
		category: 'milling',
		inputs: ['stone'],
		processingTime: 60,
		durability: 2000,
	},
	water_wheel: {
		name: 'Water Wheel',
		category: 'milling',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 120,
		durability: 1500,
	},
	wooden_gears: {
		name: 'Wooden Gears',
		category: 'milling',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 40,
		durability: 800,
	},

	// Baking Tools
	bread_oven: {
		name: 'Bread Oven',
		category: 'baking',
		inputs: ['bricks', 'clay', 'iron_ingot'],
		processingTime: 80,
		durability: 3000,
	},
	kneading_table: {
		name: 'Kneading Table',
		category: 'baking',
		inputs: ['planks', 'iron_ingot'],
		processingTime: 30,
		durability: 1000,
	},
	bread_peels: {
		name: 'Bread Peels',
		category: 'baking',
		inputs: ['wood'],
		processingTime: 15,
		durability: 500,
	},
	mixing_bowls: {
		name: 'Mixing Bowls',
		category: 'baking',
		inputs: ['glazed_pottery'],
		processingTime: 20,
		durability: 400,
	},

	// Brewing Tools
	fermentation_vats: {
		name: 'Fermentation Vats',
		category: 'brewing',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 50,
		durability: 1200,
	},
	copper_kettles: {
		name: 'Copper Kettles',
		category: 'brewing',
		inputs: ['copper_ingot'],
		processingTime: 35,
		durability: 800,
	},
	wooden_barrels: {
		name: 'Wooden Barrels',
		category: 'brewing',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 40,
		durability: 600,
	},

	// Wine Making Tools
	wine_press: {
		name: 'Wine Press',
		category: 'winemaking',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 60,
		durability: 1500,
	},

	// Dairy Tools
	butter_churn: {
		name: 'Butter Churn',
		category: 'dairy',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 25,
		durability: 600,
	},
	cheese_press: {
		name: 'Cheese Press',
		category: 'dairy',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 35,
		durability: 800,
	},
	milk_pails: {
		name: 'Milk Pails',
		category: 'dairy',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 20,
		durability: 400,
	},
	aging_racks: {
		name: 'Aging Racks',
		category: 'dairy',
		inputs: ['wood'],
		processingTime: 30,
		durability: 1000,
	},

	// Textile Tools
	spinning_wheel_mechanism: {
		name: 'Spinning Wheel Mechanism',
		category: 'textile',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 45,
		durability: 1000,
	},
	loom_frame: {
		name: 'Loom Frame',
		category: 'textile',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 60,
		durability: 1500,
	},
	shuttles: {
		name: 'Shuttles',
		category: 'textile',
		inputs: ['wood'],
		processingTime: 10,
		durability: 200,
	},
	heddles: {
		name: 'Heddles',
		category: 'textile',
		inputs: ['thread', 'iron_ingot'],
		processingTime: 20,
		durability: 400,
	},

	// Leather Working Tools
	tanning_vats: {
		name: 'Tanning Vats',
		category: 'leatherwork',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 40,
		durability: 1000,
	},
	scraping_beams: {
		name: 'Scraping Beams',
		category: 'leatherwork',
		inputs: ['wood'],
		processingTime: 20,
		durability: 600,
	},
	stretching_frames: {
		name: 'Stretching Frames',
		category: 'leatherwork',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 30,
		durability: 800,
	},

	// Metalworking Tools
	bellows: {
		name: 'Bellows',
		category: 'metalwork',
		inputs: ['leather', 'wood', 'iron_ingot'],
		processingTime: 50,
		durability: 800,
	},
	anvil: {
		name: 'Anvil',
		category: 'metalwork',
		inputs: ['iron_ingot'],
		processingTime: 80,
		durability: 5000,
	},
	forge_hearth: {
		name: 'Forge Hearth',
		category: 'metalwork',
		inputs: ['stone', 'clay', 'iron_ingot'],
		processingTime: 100,
		durability: 3000,
	},
	smithing_hammers: {
		name: 'Smithing Hammers',
		category: 'metalwork',
		inputs: ['iron_ingot', 'wood'],
		processingTime: 25,
		durability: 600,
	},
	tongs: {
		name: 'Tongs',
		category: 'metalwork',
		inputs: ['iron_ingot'],
		processingTime: 20,
		durability: 800,
	},
	quenching_tub: {
		name: 'Quenching Tub',
		category: 'metalwork',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 30,
		durability: 1000,
	},

	// Jewelry Tools
	jeweler_workbench: {
		name: 'Jeweler Workbench',
		category: 'jewelry',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 40,
		durability: 1200,
	},
	precision_tools: {
		name: 'Precision Tools',
		category: 'jewelry',
		inputs: ['iron_ingot'],
		processingTime: 35,
		durability: 400,
	},
	small_anvil: {
		name: 'Small Anvil',
		category: 'jewelry',
		inputs: ['iron_ingot'],
		processingTime: 30,
		durability: 2000,
	},

	// Pottery Tools
	pottery_wheel: {
		name: 'Pottery Wheel',
		category: 'pottery',
		inputs: ['wood', 'stone'],
		processingTime: 40,
		durability: 1500,
	},
	kiln_chamber: {
		name: 'Kiln Chamber',
		category: 'pottery',
		inputs: ['clay', 'stone'],
		processingTime: 60,
		durability: 2000,
	},
	firing_chamber: {
		name: 'Firing Chamber',
		category: 'pottery',
		inputs: ['clay', 'stone', 'iron_ingot'],
		processingTime: 80,
		durability: 2500,
	},

	// Carpentry Tools
	carpenter_workbench: {
		name: 'Carpenter Workbench',
		category: 'carpentry',
		inputs: ['wood', 'iron_ingot'],
		processingTime: 50,
		durability: 1500,
	},
	hand_saws: {
		name: 'Hand Saws',
		category: 'carpentry',
		inputs: ['iron_ingot', 'wood'],
		processingTime: 25,
		durability: 600,
	},
	chisels: {
		name: 'Chisels',
		category: 'carpentry',
		inputs: ['iron_ingot', 'wood'],
		processingTime: 20,
		durability: 400,
	},
	planes: {
		name: 'Planes',
		category: 'carpentry',
		inputs: ['iron_ingot', 'wood'],
		processingTime: 30,
		durability: 500,
	},

	// Candle Making Tools
	dipping_frames: {
		name: 'Dipping Frames',
		category: 'candle',
		inputs: ['wood'],
		processingTime: 20,
		durability: 800,
	},
	candle_molds: {
		name: 'Candle Molds',
		category: 'candle',
		inputs: ['clay', 'iron_ingot'],
		processingTime: 25,
		durability: 600,
	},
	melting_pot: {
		name: 'Melting Pot',
		category: 'candle',
		inputs: ['iron_ingot'],
		processingTime: 30,
		durability: 1000,
	},
} as const;

// ===== PRODUCTION FACILITIES =====
export const PRODUCTION_FACILITIES = {
	// Food Production
	mill: {
		name: 'Mill',
		produces: ['flour'],
		requiredTools: ['millstones', 'water_wheel', 'wooden_gears'],
		workers: 2,
		efficiency: 1.5,
	},
	bakery: {
		name: 'Bakery',
		produces: ['bread', 'meat_pie'],
		requiredTools: ['bread_oven', 'kneading_table', 'bread_peels', 'mixing_bowls'],
		workers: 3,
		efficiency: 1.2,
	},
	brewery: {
		name: 'Brewery',
		produces: ['ale', 'mead'],
		requiredTools: ['fermentation_vats', 'copper_kettles', 'wooden_barrels'],
		workers: 4,
		efficiency: 1.3,
	},
	winery: {
		name: 'Winery',
		produces: ['wine'],
		requiredTools: ['wine_press', 'fermentation_vats', 'wooden_barrels'],
		workers: 3,
		efficiency: 1.4,
	},
	dairy: {
		name: 'Dairy',
		produces: ['cheese', 'butter'],
		requiredTools: ['butter_churn', 'cheese_press', 'milk_pails', 'aging_racks'],
		workers: 2,
		efficiency: 1.1,
	},

	// Textile Production
	spinning_wheel: {
		name: 'Spinning Wheel',
		produces: ['thread', 'yarn'],
		requiredTools: ['spinning_wheel_mechanism'],
		workers: 1,
		efficiency: 1.0,
	},
	loom: {
		name: 'Loom',
		produces: ['cloth', 'fine_cloth'],
		requiredTools: ['loom_frame', 'shuttles', 'heddles'],
		workers: 2,
		efficiency: 1.2,
	},
	tannery: {
		name: 'Tannery',
		produces: ['leather', 'leather_armor'],
		requiredTools: ['tanning_vats', 'scraping_beams', 'stretching_frames'],
		workers: 3,
		efficiency: 1.1,
	},

	// Metalworking
	forge: {
		name: 'Forge',
		produces: ['iron_ingot', 'copper_ingot', 'bronze_ingot'],
		requiredTools: ['bellows', 'forge_hearth', 'tongs'],
		workers: 3,
		efficiency: 1.3,
	},
	smithy: {
		name: 'Smithy',
		produces: ['iron_tools', 'weapons'],
		requiredTools: ['anvil', 'smithing_hammers', 'tongs', 'quenching_tub'],
		workers: 2,
		efficiency: 1.4,
	},
	jeweler: {
		name: 'Jeweler',
		produces: ['jewelry'],
		requiredTools: ['jeweler_workbench', 'precision_tools', 'small_anvil'],
		workers: 1,
		efficiency: 1.8,
	},

	// Specialized Crafting
	pottery_kiln: {
		name: 'Pottery Kiln',
		produces: ['pottery', 'glazed_pottery', 'pottery_vessels'],
		requiredTools: ['pottery_wheel', 'kiln_chamber', 'firing_chamber'],
		workers: 2,
		efficiency: 1.2,
	},
	carpenter_workshop: {
		name: 'Carpenter Workshop',
		produces: ['planks', 'boards', 'wooden_furniture'],
		requiredTools: ['carpenter_workbench', 'hand_saws', 'chisels', 'planes'],
		workers: 3,
		efficiency: 1.3,
	},
	candle_maker: {
		name: 'Candle Maker',
		produces: ['candles', 'soap'],
		requiredTools: ['dipping_frames', 'candle_molds', 'melting_pot'],
		workers: 1,
		efficiency: 1.0,
	},
} as const;

// ===== RESOURCE NODES =====
export const RESOURCE_NODES = {
	farm: {
		name: 'Farm',
		produces: ['wheat', 'barley', 'oats', 'rye', 'flax'],
		buildCost: { wood: 20, iron_ingot: 10 },
		workers: 4,
		seasonal: true,
	},
	vineyard: {
		name: 'Vineyard',
		produces: ['grapes'],
		buildCost: { wood: 15, stone: 5 },
		workers: 2,
		seasonal: true,
	},
	pasture: {
		name: 'Pasture',
		produces: ['cattle', 'sheep', 'goats'],
		buildCost: { wood: 25 },
		workers: 3,
		landRequirement: 'large',
	},
	mine: {
		name: 'Mine',
		produces: ['iron_ore', 'copper_ore', 'silver_ore', 'gold_ore'],
		buildCost: { wood: 20, iron_ingot: 15, stone: 10 },
		workers: 5,
		depletes: true,
	},
	quarry: {
		name: 'Quarry',
		produces: ['stone', 'clay', 'sand'],
		buildCost: { wood: 15, iron_ingot: 10 },
		workers: 4,
		depletes: true,
	},
	forest: {
		name: 'Forest',
		produces: ['wood'],
		buildCost: { iron_ingot: 5 },
		workers: 2,
		renewable: true,
	},
	apiary: {
		name: 'Apiary',
		produces: ['honey', 'beeswax'],
		buildCost: { wood: 10 },
		workers: 1,
		seasonal: true,
	},
} as const;

// ===== TRADE ROUTES & ECONOMIC RELATIONSHIPS =====
export const TRADE_RELATIONSHIPS = {
	// Raw materials that can substitute for each other
	substitutes: {
		grains: ['wheat', 'barley', 'oats', 'rye'],
		meat: ['beef', 'pork', 'mutton', 'poultry'],
		metals: ['iron_ingot', 'copper_ingot', 'bronze_ingot'],
		sweeteners: ['honey', 'sugar'],
		fibers: ['wool', 'flax'],
	},

	// Products that compete in the same market
	competitors: {
		beverages: ['ale', 'wine', 'mead'],
		textiles: ['cloth', 'fine_cloth'],
		furniture: ['wooden_furniture', 'pottery_vessels'],
		tools: ['iron_tools', 'weapons'],
	},

	// Luxury tiers (higher tier = more expensive, satisfies luxury needs better)
	luxuryTiers: {
		basic: ['bread', 'ale', 'cloth'],
		comfortable: ['cheese', 'wine', 'fine_cloth', 'wooden_furniture'],
		luxury: ['jewelry', 'mead', 'leather_armor'],
	},
} as const;

// ===== ECONOMIC BALANCE PARAMETERS =====
export const ECONOMIC_PARAMETERS = {
	// Base production rates (per day)
	baseProductionRates: {
		raw_materials: 1.0,
		intermediary_products: 0.8,
		final_products: 0.6,
		luxury_products: 0.4,
	},

	// Price multipliers based on processing complexity
	priceMultipliers: {
		raw_materials: 1.0,
		intermediary_products: 1.5,
		final_products: 2.5,
		luxury_products: 4.0,
	},

	// Demand patterns
	demandPatterns: {
		hunger: { priority: 1, frequency: 3 }, // times per day
		thirst: { priority: 1, frequency: 4 },
		warmth: { priority: 2, frequency: 0.1 }, // seasonal
		comfort: { priority: 3, frequency: 0.5 },
		luxury: { priority: 4, frequency: 0.2 },
		protection: { priority: 2, frequency: 0.3 },
	},
} as const;

/**
 * Helper function to get all products that can be made from a given material
 */
export function getProductsFromMaterial(material: string): string[] {
	const products: string[] = [];

	// Check production tools
	Object.entries(PRODUCTION_TOOLS).forEach(([key, tool]) => {
		if ((tool.inputs as readonly string[]).includes(material)) {
			products.push(key);
		}
	});

	// Check intermediary products
	Object.entries(INTERMEDIARY_PRODUCTS).forEach(([key, product]) => {
		if ((product.inputs as readonly string[]).includes(material)) {
			products.push(key);
		}
	});

	// Check final products
	Object.entries(FINAL_PRODUCTS).forEach(([key, product]) => {
		if ((product.inputs as readonly string[]).includes(material)) {
			products.push(key);
		}
	});

	return products;
}

/**
 * Helper function to get the complete production chain for a product
 */
export function getProductionChain(product: string): string[] {
	const chain: string[] = [];

	function traceInputs(item: string, depth = 0) {
		if (depth > 10) return; // Prevent infinite loops

		chain.push(item);

		// Check if it's a production tool
		const tool = PRODUCTION_TOOLS[item as keyof typeof PRODUCTION_TOOLS];
		if (tool) {
			(tool.inputs as readonly string[]).forEach((input) => traceInputs(input, depth + 1));
			return;
		}

		// Check if it's an intermediary product
		const intermediary = INTERMEDIARY_PRODUCTS[item as keyof typeof INTERMEDIARY_PRODUCTS];
		if (intermediary) {
			(intermediary.inputs as readonly string[]).forEach((input) =>
				traceInputs(input, depth + 1),
			);
			return;
		}

		// Check if it's a final product
		const final = FINAL_PRODUCTS[item as keyof typeof FINAL_PRODUCTS];
		if (final) {
			(final.inputs as readonly string[]).forEach((input) => traceInputs(input, depth + 1));
			return;
		}
	}

	traceInputs(product);
	return [...new Set(chain)]; // Remove duplicates
}
