import type Game from '../Game';
import { Event } from '../events/Event';

export interface AttachableI<Context extends unknown[] = Game[]> {
	attach(...context: Context): void;
	detach(): void;
}

/**
 * A reusable class that DRY's two events and two methods around attaching a thing (an entity, job,
 * other) to the Game world. The class does nothing else interesting.
 *
 * Generally speaking, the items that extend this class will set some $attach.on listeners in their
 * constructor, and destroy those listeners on $detach.once.
 */
export class Attachable<Context extends unknown[] = Game[]> {
	protected $attach = new Event<Context>(`${this.constructor.name} $attach`);
	public async attach(...context: Context): Promise<this> {
		await this.$attach.emit(...context);
		return this;
	}

	protected $detach = new Event(`${this.constructor.name} $detach`);
	public async detach(): Promise<this> {
		await this.$detach.emit();
		return this;
	}
}
