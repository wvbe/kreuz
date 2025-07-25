import { Attachable } from '../classes/Attachable';
import { Prompt } from '../classes/Prompt';
import { Event } from '../events/Event';
import { EventedValue } from '../events/EventedValue';
import Game from '../Game';
import { DriverI } from './types';

export class Driver extends Attachable<[Game]> implements DriverI {
	public readonly $$animating = new EventedValue<boolean>(false, 'Driver $$animating');
	public readonly $resume = new Event('Driver $resume');
	public readonly $pause = new Event('Driver $pause');
	public readonly $end = new Event('Driver $end');
	public readonly $prompt = new Event<
		[
			{
				id: Prompt<any>;
				resolve: (result: any) => void;
				reject: (error?: Error) => void;
			},
		]
	>('Driver $prompt');

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
