import type Game from '../Game.ts';
import { Event } from './Event.ts';

/**
 * A reusable class that DRY's two events and two methods around attaching a thing (an entity, job,
 * other) to the Game world. The class does nothing else interesting.
 *
 * Generally speaking, the items that extend this class will set some $attach.on listeners in their
 * constructor, and destroy those listeners on $detach.once.
 */
export class Attachable<Context extends unknown[] = Game[]> {
	protected $attach = new Event<Context>(`${this.constructor.name} $attach`);
	public attach(...context: Context) {
		this.$attach.emit(...context);
	}

	protected $detach = new Event(`${this.constructor.name} $detach`);
	public detach() {
		this.$detach.emit();
	}
}
