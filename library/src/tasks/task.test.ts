import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { CallbackFn } from '../types.ts';
import { Task, TaskWithBacklog } from './task.ts';

describe('Task', () => {
	describe('Task with callback', () => {
		it('Resolves when callback is finished', async () => {
			const cb = mock.fn();
			const task = new Task(cb);
			expect(cb).toHaveBeenCalledTimes(0);
			task.perform();
			expect(cb).toHaveBeenCalledTimes(1);
			await task.promise;
			expect(cb).toHaveBeenCalledTimes(1);
		});
	});

	describe('Task with subtask', () => {
		it('Resolves when subtask is finished', async () => {
			const cb = mock.fn();
			const subtask = new Task(cb);
			const task = new TaskWithBacklog(null, [subtask]);

			expect(cb).toHaveBeenCalledTimes(0);
			task.perform();
			expect(cb).toHaveBeenCalledTimes(1);
			await task.promise;
			expect(cb).toHaveBeenCalledTimes(1);
		});
	});

	describe('Task that schedules new subtasks as it goes', () => {
		it('Resolves when subtask is finished', async () => {
			const recalibrate = mock.fn();
			class TestTask extends TaskWithBacklog<never[]> {
				finishedSubtasks = 0;
				constructor(cb: CallbackFn) {
					super(cb, []);
					this.subtasks.$add.on(recalibrate);
				}
			}
			const cb1 = mock.fn();
			const cb2 = mock.fn();
			const task = new TestTask(() => {
				task.addSubTask(new Task<never[]>(cb1));
				task.addSubTask(
					new TestTask(() => {
						task.addSubTask(new Task<never[]>(cb2));
					}),
				);
			});

			expect(cb1).toHaveBeenCalledTimes(0);
			expect(cb2).toHaveBeenCalledTimes(0);
			expect(recalibrate).toHaveBeenCalledTimes(0);

			task.perform();
			await task.promise;

			// Two tasks have a callback, and each task is performed once
			expect(cb1).toHaveBeenCalledTimes(1);
			expect(cb2).toHaveBeenCalledTimes(1);

			// .addSubTask is called 3 times
			expect(recalibrate).toHaveBeenCalledTimes(3);
		});
	});

	// describe('$interrupt', () => {
	// 	class InterruptableTask extends Task<never[]> {
	// 		constructor() {
	// 			super(
	// 				() =>
	// 					new Promise((res) => {
	// 						const t = setTimeout(res, 10);
	// 						this.$interrupt.once(() => clearTimeout(t));
	// 					}),
	// 			);
	// 		}
	// 	}
	// });
});

run();
