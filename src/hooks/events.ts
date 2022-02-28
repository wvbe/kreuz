import { DependencyList, useEffect } from 'react';
import { Event } from '../classes/Event';

export function useEventCallback<Args extends unknown[]>(
	event: Event<Args>,
	callback: (...args: Args) => void,
	dependencies: DependencyList
): void {
	useEffect(
		() => event.on(callback),
		[
			event,
			callback,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			...dependencies
		]
	);
}

// export function useEventData<Data>(
// 	event: Event,
// 	reducer: () => Data,
// 	dependencies: DependencyList
// ): Data {
// 	const [state, setState] = useState(reducer());
// 	const callback = useCallback(() => {
// 		setState(reducer());
// 	}, [setState, ...dependencies]);
// 	useEffect(() => {
// 		callback();
// 	}, [event, ...dependencies]);
// 	useEventCallback(event, callback, []);
// 	return state;
// }
