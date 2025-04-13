const fs = require('fs');
const path = require('path');

const testFiles = [
	'src/lib/level-1/events/Collection.test.ts',
	'src/lib/level-1/events/EventedNumericValue.test.ts',
	'src/lib/level-1/events/KeyedCollection.test.ts',
	'src/lib/level-1/events/Event.test.ts',
	'src/lib/level-1/events/CollectionBucket.test.ts',
	'src/lib/level-1/time/Time.test.ts',
	'src/lib/level-1/time/timeToString.test.ts',
	'src/lib/level-1/ecs/systems/logisticsSystem.test.ts',
	'src/lib/level-1/ecs/components/pathingComponent/Path.test.ts',
	'src/lib/level-1/ecs/systems/logisticsSystem/LogisticsExchange.test.ts',
	'src/lib/level-1/ecs/components/productionComponent/Blueprint.test.ts',
	'src/lib/level-1/ecs/components/inventoryComponent/Inventory.test.ts',
	'src/lib/level-1/ecs/systems/productionSystem.test.ts',
	'src/lib/level-1/terrain/Terrain.test.ts',
	'src/lib/level-1/utilities/ReplacementSpace.test.ts',
	'src/lib/level-1/classes/Random.test.ts',
	'src/lib/level-3/generators/generateFamilyTree.test.ts',
	'src/lib/level-2/behavior/loiterNode.test.ts',
];

function convertTestFile(filePath) {
	let content = fs.readFileSync(filePath, 'utf8');

	// Replace imports
	content = content
		.replace(
			/import\s*{[^}]*}\s*from\s*['"]@test['"];?/g,
			"import { expect } from '@jest/globals';",
		)
		.replace(
			/import\s*{[^}]*}\s*from\s*['"]@lib['"];?/g,
			"import { personArchetype } from '../../../lib';",
		)
		.replace(
			/import\s*{[^}]*}\s*from\s*['"]@lib\/core['"];?/g,
			"import { EcsEntity } from '../../../lib';",
		)
		.replace(/import\s*{\s*describe\s*}\s*from\s*['"]vitest['"];?/g, '')
		.replace(/\.ts(['"])/g, '$1')
		.replace(/mock\.fn/g, 'jest.fn');

	// Replace Deno.test with Jest describe/it
	content = content.replace(
		/Deno\.test\(['"]([^'"]+)['"]\s*,\s*async\s*\(test\)\s*=>\s*{([\s\S]*?)}\s*\);?/g,
		(match, testName, testBody) => {
			// Convert test.step to it
			testBody = testBody.replace(
				/test\.step\(['"]([^'"]+)['"]\s*,\s*async\s*\(\)\s*=>\s*{([\s\S]*?)}\s*\);?/g,
				"it('$1', async () => {$2});",
			);
			return `describe('${testName}', () => {\n  it('should work', async () => {${testBody}  });\n});`;
		},
	);

	// Replace simple Deno.test without test.step
	content = content.replace(
		/Deno\.test\(['"]([^'"]+)['"]\s*,\s*\(\)\s*=>\s*{([\s\S]*?)}\s*\);?/g,
		"describe('$1', () => {\n  it('should work', () => {$2  });\n});",
	);

	fs.writeFileSync(filePath, content);
}

// Create scripts directory if it doesn't exist
if (!fs.existsSync('scripts')) {
	fs.mkdirSync('scripts');
}

// Convert all test files
testFiles.forEach(convertTestFile);

console.log('Test files converted successfully!');
