import { ReactElement } from 'react';
import { Event } from '../classes/Event';
import { CoordinateI } from '../types';

/**
 * Logic
 */
type ContextManagerState =
	| false
	| {
			location: CoordinateI;
			contents: ReactElement;
	  };

export class ContextMenuController {
	public state: ContextManagerState = false;
	public $changed = new Event<[ContextManagerState]>();

	open(location: CoordinateI, contents: ReactElement) {
		this.state = { location, contents };
		this.$changed.emit(this.state);
	}

	isOpen() {
		return !!this.state;
	}

	close() {
		this.state = false;
		this.$changed.emit(this.state);
	}
}
