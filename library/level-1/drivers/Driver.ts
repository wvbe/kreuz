import { Attachable } from '../classes/Attachable.ts';
import { Prompt } from '../classes/Prompt.ts';
import { Event } from '../events/Event.ts';
import { EventedValue } from '../events/EventedValue.ts';
import Game from '../Game.ts';
import { DriverI } from './types.ts';

export class Driver extends Attachable<[Game]> implements DriverI {
	public readonly $$animating = new EventedValue<boolean>(false, 'Driver $$animating');
	public readonly $resume = new Event('Driver $resume');
	public readonly $pause = new Event('Driver $pause');
	public readonly $end = new Event('Driver $end');
	public readonly $prompt = new Event<[Prompt<any>, (result: any) => void, (error: Error) => void]>(
		'Driver $prompt',
	);

	/**
	 * @TODO should not return a promise, more like return destroyer
	 */
	public async start(): Promise<void> {
		if (this.$$animating.get()) {
			throw new Error('Animation already started');
		}
		await this.$$animating.set(true);
		await this.$resume.emit();
	}

	public async stop(): Promise<void> {
		if (!this.$$animating.get()) {
			throw new Error('Animation not started');
		}
		await this.$$animating.set(false);
		await this.$pause.emit();
	}

	public async startUntilStop(): Promise<void> {
		return new Promise<void>(async (res) => {
			this.$end.once(res);
			await this.start();
		});
	}
}
