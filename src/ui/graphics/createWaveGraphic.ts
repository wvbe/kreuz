const getRandomFloat = (min: number, max: number) => min + Math.random() * (max - min);
/**
 * Creates a 32x32 pixel canvas with wave squiggles and returns a blob URL
 * @returns Promise that resolves to a blob URL of the generated wave graphic
 */
export async function createWaveGraphic(color = '#87CEEB'): Promise<string> {
	const size = 32;
	// Create a 32x32 canvas element
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2D context from canvas');
	}

	// Clear the canvas with a transparent background
	ctx.clearRect(0, 0, size, size);

	// Set up drawing properties for the waves
	ctx.strokeStyle = color; // Blue color for waves
	ctx.lineWidth = 1.5;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	// Draw multiple wave squiggles
	const drawWave = (startX: number, startY: number, amplitude: number, frequency: number) => {
		ctx.beginPath();
		ctx.moveTo(startX, startY);

		for (let x = getRandomFloat(0, size / 2); x <= getRandomFloat(size / 2, size); x += 2) {
			const y = startY + amplitude * Math.sin((x * frequency * Math.PI) / (size / 2));
			ctx.lineTo(startX + x, y);
		}

		ctx.stroke();
	};

	// Draw 3-4 wave lines with different properties
	// drawWave(0, getRandomFloat(3, 9), 3, getRandomFloat(1, 2)); // Top wave
	// drawWave(0, getRandomFloat(12, 20), 4, getRandomFloat(1, 2)); // Middle wave - slightly larger amplitude
	// drawWave(0, getRandomFloat(22, 28), 2.5, getRandomFloat(1, 2)); // Bottom wave - higher frequency

	drawWave(0, getRandomFloat(3, 28), 2.5, getRandomFloat(1, 2));

	// Add some foam/bubble effects
	ctx.fillStyle = color; // Light blue for foam
	ctx.globalAlpha = 0.6;

	// Draw small circles to represent foam bubbles
	const bubbles = [
		{ x: getRandomFloat(3, size - 3), y: getRandomFloat(3, size - 3), r: 1 },
		{ x: getRandomFloat(3, size - 3), y: getRandomFloat(3, size - 3), r: 0.8 },
		// { x: getRandomFloat(3, size - 3), y: getRandomFloat(3, size - 3), r: 1.2 },
		// { x: getRandomFloat(3, size - 3), y: getRandomFloat(3, size - 3), r: 0.9 },
	];

	bubbles.forEach((bubble) => {
		ctx.beginPath();
		ctx.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);
		ctx.fill();
	});

	// Reset alpha
	ctx.globalAlpha = 1;

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
 * Cleans up a blob URL created by createWaveGraphic
 * @param url The blob URL to revoke
 */
export function revokeWaveGraphicUrl(url: string): void {
	URL.revokeObjectURL(url);
}
