import { EventedValue } from '../classes/EventedValue.ts';
import Game from '../Game.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { BuildingEntity } from './BuildingEntity.ts';
import { EntityI } from './types.ts';

enum FactoryState {
	IDLE,
	BUSY,
}

export class FactoryBuildingEntity extends BuildingEntity implements EntityI {
	public blueprint: Blueprint | null = null;

	public attach(game: Game) {
		this.$detach.once(
			this.$$blueprint.on((blueprint) => {
				// @TODO start evaluating if we can run the blueprint.
			}),
		);
	}

	protected readonly $$state = new EventedValue<FactoryState>(
		FactoryState.IDLE,
		'FactoryBuildingEntity $$state',
	);

	protected readonly $$blueprint = new EventedValue<BlueprintI | null>(
		null,
		'FactoryBuildingEntity $$blueprint',
	);

	private isBusy() {
		return this.$$state.get() === FactoryState.BUSY;
	}

	private setState(state: FactoryState) {
		if (this.isBusy()) {
			console.warn('Cannot change the state of a busy factory');
			// why not???
			return;
		}
		this.$$state.set(state);
	}

	public setBlueprint(blueprint: Blueprint | null) {
		if (this.isBusy()) {
			throw new Error('Cannot change blueprint while buiding is busy');
		}
		this.$$blueprint.set(blueprint);
		if (!blueprint) {
			this.setState(FactoryState.IDLE);
		}
	}
}
