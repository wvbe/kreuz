import Logger from './classes/Logger';
import { Scene } from './classes/Scene';
import { ContextMenuManager } from './ui/ContextMenu';

export class Game {
	public readonly contextMenu = new ContextMenuManager();
	public readonly scene: Scene;

	constructor(scene: Scene) {
		this.scene = scene;
	}
	destroy() {
		Logger.group(`Destroy ${this.constructor.name}`);
		this.scene.destroy();
		Logger.groupEnd();
	}
}
