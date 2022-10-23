import { AttachableI } from '../classes/Attachable.ts';
import { Collection } from '../classes/Collection.ts';
import { Event } from '../classes/Event.ts';
import { EventedPromise } from '../classes/EventedPromise.ts';
import Game from '../Game.ts';
import { CallbackFn } from '../types.ts';

function noop() {
	// no operation
}

type TaskFn = () => Promise<void>;

/**
 * A task is a sequence of stuff to do. Like a promise, it has a clear beginning (= $attach) and an end (= $detach).
 *
 * The procedure of the task itself could be expressed as literally a promise, and/or as subtasks.
 *
 * In the constructor you may set event listeners that allow you to re-prioritize subtasks as you
 * see fit.
 */
export class Task extends EventedPromise implements AttachableI {
	/*
	 * implement AttachableI:
	 */
	protected $attach = new Event<[Game]>(`${this.constructor.name} $attach`);
	public attach(game: Game) {
		this.$attach.emit(game);
	}
	protected $detach = new Event(`${this.constructor.name} $detach`);
	public detach() {
		this.$detach.emit();
	}

	/**
	 * The function itself. Get and set event listeners.
	 *
	 * - Resolve to void if the job is entirely done, in which case the job parent might start a
	 *   sibling job or resolve itself.
	 * - Reject promise if the job is interrupted/could not be completed.
	 */
	private callback: TaskFn | null = null;
	private children = new Collection<Task>();

	protected $prioritize = new Event(`${this.constructor.name} $prioritize`);

	// $interrupt is a bottom-up event -- meaning the top-level task may emit it, and it is emitted
	// into the subtasks that emit it into their own subtasks.

	// $finish is a top-down event -- meaning a subtask may emit it, and parent tasks may then also
	// emit it.
	constructor(callback: TaskFn | null, children: Task[]) {
		super();

		this.children.$add.on((added) => {
			this.$prioritize.emit();
			added.forEach((subtask) => {
				this.$interrupt.on(() => subtask.$interrupt.emit());
			});
		});

		this.children.add(...children);

		this.callback = callback;
	}

	protected prioritize(): void {
		// Sort this.children, if you want.
		console.error(`Prioritizing subtasks of ${this.constructor.name}`);
	}
}
