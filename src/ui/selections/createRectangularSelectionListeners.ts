import { Event } from '../../game/core/events/Event';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { getViewportControls } from '../stores/selectedActionStore';

type RectangularSelectionStatus = {
	start: QualifiedCoordinate;
	end: QualifiedCoordinate;
};

/**
 * The event that every remaining event listener for an action should be removed.
 */
export const GLOBAL_UNSET_ACTION_LISTENERS = new Event('globalCancelAction');

/**
 * A function that sets the necessary event listeners to detect a rectangular selection across
 * the map element (grabbed from the selected action store).
 */
export function createRectangularSelectionListeners(): {
	/**
	 * Set event listeners
	 */
	listen: () => void;
	/**
	 * Resolves a start/stop pair of {@link QualifiedCoordina}, or `null` if the action is cancelled
	 */
	promise: () => Promise<RectangularSelectionStatus | null>;

	$change: Event<[RectangularSelectionStatus]>;
	$finish: Event<[RectangularSelectionStatus | null]>;
} {
	const panzoomControls = getViewportControls();
	const element = panzoomControls.getPanzoomContainer();
	const $cancel = new Event('RectangularSelectionTool $cancel');
	const $change = new Event<[RectangularSelectionStatus]>('RectangularSelectionTool $change');

	// Emits `null` if the action is cancelled
	const $finish = new Event<[RectangularSelectionStatus | null]>(
		'RectangularSelectionTool $finish',
	);

	let dragStatus: RectangularSelectionStatus | null = null;

	// Whenever anybody cancels an action from anywhere, clean up after ourselves if we haven't
	// done so already.
	const removeCleanupListener = GLOBAL_UNSET_ACTION_LISTENERS.on(async () => {
		dragStatus = null;
		// await $finish.emit(null);
		panzoomControls.getPanzoomInstance()?.resume();

		element.removeEventListener('mousedown', onMouseDown);
		element.removeEventListener('contextmenu', onContextMenu);
		element.removeEventListener('mousemove', onMouseMove);
		element.ownerDocument.removeEventListener('mouseup', onMouseUp);

		removeCleanupListener();
	});

	const onMouseDown = async ({ x, y }: MouseEvent) => {
			const coordinate = panzoomControls.getCoordinateFromContainerPixels(x, y);
			dragStatus = { start: coordinate, end: coordinate };

			element.removeEventListener('mousedown', onMouseDown);
			element.addEventListener('mousemove', onMouseMove);
			element.ownerDocument.addEventListener('mouseup', onMouseUp, { once: true });
			element.ownerDocument.addEventListener('contextmenu', onContextMenu, { once: true });

			panzoomControls.getPanzoomInstance()?.pause();
			await $change.emit({ ...dragStatus });
		},
		onContextMenu = async (event: MouseEvent) => {
			event.preventDefault();
			await $cancel.emit();
			await GLOBAL_UNSET_ACTION_LISTENERS.emit();
		},
		onMouseMove = async ({ x, y }: MouseEvent) => {
			if (!dragStatus) {
				throw new Error('Could not find the expected mouse drag status');
			}

			dragStatus.end = panzoomControls.getCoordinateFromContainerPixels(x, y);

			void $change.emit({ ...dragStatus });
		},
		onMouseUp = async () => {
			if (!dragStatus) {
				throw new Error('Could not find the expected mouse drag status');
			}

			const copy = { ...dragStatus };
			await GLOBAL_UNSET_ACTION_LISTENERS.emit();
			await $finish.emit(copy);
		};

	return {
		listen: () => {
			element.addEventListener('mousedown', onMouseDown, { once: true });
		},
		promise: () => {
			return new Promise<RectangularSelectionStatus | null>((resolve) => {
				const x = $finish.once((selection) => {
					y();
					resolve(selection);
				});
				const y = $cancel.once(() => {
					x();
					resolve(null);
				});
				element.addEventListener('mousedown', onMouseDown, { once: true });
			});
		},
		$change,
		$finish,
	};
}
