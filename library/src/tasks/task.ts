import { AttachableI } from '../classes/Attachable.ts';
import { Collection } from '../classes/Collection.ts';
import { Event } from '../classes/Event.ts';
import { EventedPromise } from '../classes/EventedPromise.ts';
import { TaskFn } from './types.ts';

/**
 * A task is a sequence of stuff to do. Like a promise, it has a clear beginning (= $attach) and an end (= $detach).
 *
 * The procedure of the task itself could be expressed as literally a promise, and/or as subtasks.
 *
 * In the constructor you may set event listeners that allow you to re-prioritize subtasks as you
 * see fit.
 *
 * @TODO maybe simplify by not relying on EventedPromise.
 */
export class Task<Context extends unknown[]>
	extends EventedPromise
	implements AttachableI<Context>
{
	/*
	 * implement AttachableI, but with additional EntityI context
	 */
	protected $attach = new Event<Context>(`${this.constructor.name} $attach`);
	public attach(...args: Context) {
		this.$attach.emit(...args);
	}
	protected $detach = new Event(`${this.constructor.name} $detach`);
	public detach() {
		this.$detach.emit();
	}

	#callback: TaskFn<Context> | null = null;

	// $interrupt is a bottom-up event -- meaning the top-level task may emit it, and it is emitted
	// into the subtasks that emit it into their own subtasks.

	// $finish is a top-down event -- meaning a subtask may emit it, and parent tasks may then also
	// emit it.

	constructor(callback: TaskFn<Context> | null) {
		super();
		this.#callback = callback;
		this.$attach.on((...context) => {
			this.perform(...context);
		});

		// @TODO unset all listeners on finish
		// this.$finish.on(() => this.detach());

		this.$detach.on(() => this.$interrupt.emit());
	}

	protected getNextSubtask(
		...context: Context
	): Task<Context> | null | Promise<Task<Context> | null> {
		return null;
	}

	/**
	 * @TODO
	 */
	get label() {
		return 'To do';
	}

	public async perform(...context: Context) {
		if (this.#callback) {
			await this.#callback(...context);
		}

		let nextTask;
		while ((nextTask = await this.getNextSubtask(...context))) {
			nextTask.perform(...context);
			await nextTask.promise.catch((reason) => {
				if (reason instanceof Error) {
					throw reason;
				}
				// Otherwise _swallow reason_
			});
			nextTask.detach();
		}

		this.$finish.emit();
	}
}

export class TaskWithBacklog<Context extends unknown[]> extends Task<Context> {
	protected subtasks = new Collection<Task<Context>>();

	public constructor(cb: TaskFn<Context> | null, subtasks: Task<Context>[]) {
		super(cb);

		this.subtasks.$add.on((added) => {
			added.forEach((subtask) => {
				this.$interrupt.on(() => subtask.$interrupt.emit());
			});
		});

		this.subtasks.add(...subtasks);
	}

	protected getNextSubtask() {
		return this.subtasks.shift() || null;
	}

	protected prioritize(): void {
		// Sort this.children, if you want.
		console.error(`Prioritizing subtasks of ${this.constructor.name}`);
	}

	public addSubTask(task: Task<Context>) {
		this.subtasks.add(task);
	}
}
