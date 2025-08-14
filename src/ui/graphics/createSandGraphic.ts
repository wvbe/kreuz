const getRandomFloat = (min: number, max: number) => min + Math.random() * (max - min);
const getRandomInt = (min: number, max: number) => Math.floor(getRandomFloat(min, max + 1));

/**
 * Creates a 32x32 pixel canvas with sand texture and returns a blob URL
 * @param baseColor The base sand color (default: sandy brown)
 * @returns Promise that resolves to a blob URL of the generated sand graphic
 */
export async function createSandGraphic(baseColor = '#D2B48C'): Promise<string> {
	const size = 32;
	// Create a 32x32 canvas element
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2D context from canvas');
	}

	// Fill with base sand color
	ctx.fillStyle = baseColor;
	ctx.fillRect(0, 0, size, size);

	// Create sand grain variations by adding random pixels with slightly different colors
	const imageData = ctx.getImageData(0, 0, size, size);
	const data = imageData.data;

	// Parse base color to RGB
	const baseR = parseInt(baseColor.slice(1, 3), 16);
	const baseG = parseInt(baseColor.slice(3, 5), 16);
	const baseB = parseInt(baseColor.slice(5, 7), 16);

	// Add random color variations to simulate sand grains
	for (let i = 0; i < data.length; i += 4) {
		// Add random variation to each color channel
		const variation = getRandomFloat(-30, 30);
		data[i] = Math.max(0, Math.min(255, baseR + variation)); // Red
		data[i + 1] = Math.max(0, Math.min(255, baseG + variation)); // Green
		data[i + 2] = Math.max(0, Math.min(255, baseB + variation)); // Blue
		// Alpha stays at 255 (fully opaque)
	}

	// Apply the modified image data
	ctx.putImageData(imageData, 0, 0);

	// Add some larger sand grain details
	const grainCount = getRandomInt(2, 5);
	for (let i = 0; i < grainCount; i++) {
		const x = getRandomFloat(0, size);
		const y = getRandomFloat(0, size);
		const radius = getRandomFloat(0.5, 1.5);

		// Vary the grain color
		const grainBrightness = getRandomFloat(0.7, 1.3);
		const grainR = Math.max(0, Math.min(255, baseR * grainBrightness));
		const grainG = Math.max(0, Math.min(255, baseG * grainBrightness));
		const grainB = Math.max(0, Math.min(255, baseB * grainBrightness));

		ctx.fillStyle = `rgb(${grainR}, ${grainG}, ${grainB})`;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	// Add some darker spots to simulate shadows between grains
	const shadowCount = getRandomInt(2, 5);
	for (let i = 0; i < shadowCount; i++) {
		const x = getRandomFloat(0, size);
		const y = getRandomFloat(0, size);
		const radius = getRandomFloat(0.3, 1);

		ctx.fillStyle = `rgba(0, 0, 0, ${getRandomFloat(0.1, 0.3)})`;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	// Add some lighter highlights
	const highlightCount = getRandomInt(2, 5);
	for (let i = 0; i < highlightCount; i++) {
		const x = getRandomFloat(0, size);
		const y = getRandomFloat(0, size);
		const radius = getRandomFloat(0.2, 0.8);

		ctx.fillStyle = `rgba(255, 255, 255, ${getRandomFloat(0.2, 0.4)})`;
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
 * Cleans up a blob URL created by createSandGraphic
 * @param url The blob URL to revoke
 */
export function revokeSandGraphicUrl(url: string): void {
	URL.revokeObjectURL(url);
}
