export class GraphicsCache {
	public constructor(private readonly generator: () => Promise<string>) {}

	private cache: Promise<string>[] = [];

	public async get(): Promise<string | null> {
		console.log('get', this.cache.length);
		if (this.cache.length > 3) {
			return this.cache[Math.floor(Math.random() * this.cache.length)];
		}

		const newImage = this.generator();
		this.cache.push(newImage);
		return newImage;
	}
}
