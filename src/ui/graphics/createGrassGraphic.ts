const getRandomFloat = (min: number, max: number) => min + Math.random() * (max - min);
const getRandomInt = (min: number, max: number) => Math.floor(getRandomFloat(min, max + 1));

/**
 * Creates a 32x32 pixel canvas with grass texture and returns a blob URL
 * @param baseColor The base grass color (default: forest green)
 * @returns Promise that resolves to a blob URL of the generated grass graphic
 */
export async function createGrassGraphic(baseColor = '#228B22'): Promise<string> {
	const size = 32;
	// Create a 32x32 canvas element
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2D context from canvas');
	}

	// Fill with base grass color
	ctx.fillStyle = baseColor;
	ctx.fillRect(0, 0, size, size);

	// Parse base color to RGB
	const baseR = parseInt(baseColor.slice(1, 3), 16);
	const baseG = parseInt(baseColor.slice(3, 5), 16);
	const baseB = parseInt(baseColor.slice(5, 7), 16);

	// Create grass texture by adding random color variations
	const imageData = ctx.getImageData(0, 0, size, size);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		// Add random variation to each color channel
		const variation = getRandomFloat(-20, 20);
		data[i] = Math.max(0, Math.min(255, baseR + variation)); // Red
		data[i + 1] = Math.max(0, Math.min(255, baseG + variation)); // Green
		data[i + 2] = Math.max(0, Math.min(255, baseB + variation)); // Blue
		// Alpha stays at 255 (fully opaque)
	}

	// Apply the modified image data
	ctx.putImageData(imageData, 0, 0);

	// Draw individual grass blades
	const bladeCount = getRandomInt(8, 15);
	for (let i = 0; i < bladeCount; i++) {
		const x = getRandomFloat(2, size - 2);
		const startY = getRandomFloat(size * 0.6, size);
		const height = getRandomFloat(4, 12);
		const width = getRandomFloat(0.5, 1.5);

		// Vary the blade color (usually darker green)
		const bladeBrightness = getRandomFloat(0.6, 0.9);
		const bladeR = Math.max(0, Math.min(255, baseR * bladeBrightness));
		const bladeG = Math.max(0, Math.min(255, baseG * bladeBrightness));
		const bladeB = Math.max(0, Math.min(255, baseB * bladeBrightness));

		ctx.fillStyle = `rgb(${bladeR}, ${bladeG}, ${bladeB})`;

		// Draw grass blade as a tapered rectangle
		ctx.beginPath();
		ctx.moveTo(x - width / 2, startY);
		ctx.lineTo(x + width / 2, startY);
		ctx.lineTo(x + width / 4, startY - height);
		ctx.lineTo(x - width / 4, startY - height);
		ctx.closePath();
		ctx.fill();
	}

	// Add some taller grass blades with slight curves
	const tallBladeCount = getRandomInt(3, 6);
	for (let i = 0; i < tallBladeCount; i++) {
		const x = getRandomFloat(2, size - 2);
		const startY = getRandomFloat(size * 0.7, size);
		const height = getRandomFloat(8, 16);
		const curve = getRandomFloat(-2, 2);

		// Vary the blade color
		const bladeBrightness = getRandomFloat(0.5, 0.8);
		const bladeR = Math.max(0, Math.min(255, baseR * bladeBrightness));
		const bladeG = Math.max(0, Math.min(255, baseG * bladeBrightness));
		const bladeB = Math.max(0, Math.min(255, baseB * bladeBrightness));

		ctx.strokeStyle = `rgb(${bladeR}, ${bladeG}, ${bladeB})`;
		ctx.lineWidth = getRandomFloat(1, 2);
		ctx.lineCap = 'round';

		// Draw curved grass blade
		ctx.beginPath();
		ctx.moveTo(x, startY);
		ctx.quadraticCurveTo(x + curve, startY - height / 2, x + curve * 1.5, startY - height);
		ctx.stroke();
	}

	// Add some darker patches to simulate soil showing through
	const soilPatchCount = getRandomInt(2, 5);
	for (let i = 0; i < soilPatchCount; i++) {
		const x = getRandomFloat(0, size);
		const y = getRandomFloat(0, size);
		const radius = getRandomFloat(1, 3);

		ctx.fillStyle = `rgba(101, 67, 33, ${getRandomFloat(0.3, 0.6)})`; // Brown soil color
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	// Add some lighter highlights to simulate dew or sunlight
	const highlightCount = getRandomInt(2, 5);
	for (let i = 0; i < highlightCount; i++) {
		const x = getRandomFloat(0, size);
		const y = getRandomFloat(0, size);
		const radius = getRandomFloat(0.5, 1.5);

		ctx.fillStyle = `rgba(255, 255, 255, ${getRandomFloat(0.1, 0.3)})`;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	// Convert canvas to blob and create URL
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				const url = URL.createObjectURL(blob);
				resolve(url);
			} else {
				reject(new Error('Failed to create blob from canvas'));
			}
		}, 'image/png');
	});
}

/**
 * Cleans up a blob URL created by createGrassGraphic
 * @param url The blob URL to revoke
 */
export function revokeGrassGraphicUrl(url: string): void {
	URL.revokeObjectURL(url);
}
