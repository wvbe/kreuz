let identifier = 0;
export class Prompt<ReturnGeneric extends { [key: string]: any }> {
	public readonly identifier = identifier++;
}
