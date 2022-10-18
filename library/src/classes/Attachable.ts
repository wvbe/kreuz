import Game from '../Game.ts';
import { Event } from './Event.ts';

export class Attachable<Context extends unknown[] = Game[]> {
	protected $attach = new Event<Context>(`${this.constructor.name} $attach`, true);
	public attach(...context: Context) {
		this.$attach.emit(...context);
	}

	protected $detach = new Event(`${this.constructor.name} $detach`, true);
	public detach() {
		this.$detach.emit();
	}
}
