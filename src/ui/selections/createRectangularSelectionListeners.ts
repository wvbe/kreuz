import { Event } from '../../game/core/events/Event';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { getViewportControls } from '../stores/selectedActionStore';

type RectangularSelectionStatus = {
	start: QualifiedCoordinate;
	end: QualifiedCoordinate;
};

/**
 * A function that sets the necessary event listeners to detect a rectangular selection across
 * the map element (grabbed from the selected action store).
 */
export function createRectangularSelectionListeners(): {
	/**
	 * Skibidi
	 */
	listen: () => void;
	/**
	 * Boink
	 */
	promise: () => Promise<RectangularSelectionStatus | null>;
	$change: Event<[RectangularSelectionStatus]>;
	$finish: Event<[RectangularSelectionStatus]>;
	$cancel: Event<[RectangularSelectionStatus]>;
} {
	const panzoomControls = getViewportControls();
	const element = panzoomControls.getPanzoomContainer();

	const $change = new Event<[RectangularSelectionStatus]>('RectangularSelectionTool $change');
	const $finish = new Event<[RectangularSelectionStatus]>('RectangularSelectionTool $selection');
	const $cancel = new Event<[RectangularSelectionStatus]>('RectangularSelectionTool $selection');

	let dragStatus: RectangularSelectionStatus | null = null;

	const onMouseDown = async ({ x, y }: MouseEvent) => {
			const coordinate = panzoomControls.getCoordinateFromContainerPixels(x, y);
			dragStatus = { start: coordinate, end: coordinate };

			$change.emit({ ...dragStatus });

			element.removeEventListener('mousedown', onMouseDown);

			element.addEventListener('mousemove', onMouseMove);
			element.ownerDocument.addEventListener('mouseup', onMouseUp, { once: true });
			element.ownerDocument.addEventListener('contextmenu', onContextMenu, { once: true });
		},
		onContextMenu = async () => {
			if (!dragStatus) {
				throw new Error('Could not find the expected mouse drag status');
			}
			const copy = { ...dragStatus };
			dragStatus = null;
			dragStatus = null;

			element.removeEventListener('mousemove', onMouseMove);
			element.ownerDocument.removeEventListener('mouseup', onMouseUp);
			element.ownerDocument.removeEventListener('contextmenu', onContextMenu);

			void $cancel.emit(copy);
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
			dragStatus = null;

			element.removeEventListener('mousemove', onMouseMove);
			element.ownerDocument.removeEventListener('mouseup', onMouseUp);
			element.ownerDocument.removeEventListener('contextmenu', onContextMenu);

			void $finish.emit(copy);
		};

	return {
		listen: () => {
			element.addEventListener('mousedown', onMouseDown, { once: true });
		},
		promise: () => {
			return new Promise<RectangularSelectionStatus | null>((resolve) => {
				const destroyFinishListener = $finish.once((dragStatus) => {
					resolve(dragStatus);
					destroyCancelListener();
				});

				const destroyCancelListener = $cancel.once((dragStatus) => {
					resolve(null);
					destroyFinishListener();
				});

				element.addEventListener('mousedown', onMouseDown, { once: true });
			});
		},
		$change,
		$finish,
		$cancel,
	};
}
