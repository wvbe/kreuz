export class GraphicsCache {
	public constructor(private readonly generator: () => Promise<string>) {}

	private cache: Promise<string>[] = [];

	/**
	 * @note currently this function is called more often than i'd like
	 */
	public async get(): Promise<string | null> {
		if (this.cache.length > 3) {
			return this.cache[Math.floor(Math.random() * this.cache.length)];
		}

		const newImage = this.generator();
		this.cache.push(newImage);
		return newImage;
	}
}
