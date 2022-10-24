
export type TaskFn<Context extends unknown[]> = (...context: Context) => Promise<void> | void;
