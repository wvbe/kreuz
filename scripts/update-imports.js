const fs = require('fs');
const path = require('path');

function updateImports(filePath) {
	let content = fs.readFileSync(filePath, 'utf8');

	// Replace @lib/core imports with relative imports from mod.ts
	content = content.replace(
		/import\s*{([^}]+)}\s*from\s*['"]@lib\/core['"];?/g,
		(match, imports) => {
			const relativePath = path
				.relative(path.dirname(filePath), path.join(process.cwd(), 'src/lib/level-2/mod'))
				.replace(/\\/g, '/');
			return `import {${imports}} from '${relativePath}';`;
		},
	);

	fs.writeFileSync(filePath, content);
}

// Get all TypeScript files recursively
function getAllFiles(dir) {
	const files = [];
	const items = fs.readdirSync(dir);

	for (const item of items) {
		const fullPath = path.join(dir, item);
		if (fs.statSync(fullPath).isDirectory()) {
			files.push(...getAllFiles(fullPath));
		} else if (fullPath.endsWith('.ts')) {
			files.push(fullPath);
		}
	}

	return files;
}

const files = getAllFiles('src');
files.forEach((file) => {
	if (fs.readFileSync(file, 'utf8').includes('@lib/assets')) {
		console.log(`Updating imports in ${file}`);
		updateImports(file);
	}
});

console.log('Imports updated successfully!');
