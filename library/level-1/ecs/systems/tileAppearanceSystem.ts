import Game from '../../Game.ts';
import { type Material } from '../../inventory/Material.ts';
import { needsComponent } from '../components/needsComponent.ts';
import { EcsSystem } from '../classes/EcsSystem.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { pathableComponent } from '../components/pathableComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { outlineComponent } from '../components/outlineComponent.ts';
import { surfaceComponent } from '../components/surfaceComponent.ts';
import { Blueprint } from '../components/productionComponent/Blueprint.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { vendorComponent } from '../components/vendorComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { EcsEntity } from '../types.ts';
import { Need } from '../../entities/Need.ts';
import { ownerComponent } from '../components/ownerComponent.ts';
import { byEcsComponents } from '../assert.ts';

type TileEntity = EcsEntity<
	| typeof locationComponent
	| typeof outlineComponent
	| typeof surfaceComponent
	| typeof pathableComponent
>;

function attachSystemToEntity(entity: TileEntity) {}

async function attachSystem(game: Game) {
	game.terrain.tiles
		.filter(
			byEcsComponents([locationComponent, outlineComponent, surfaceComponent, pathableComponent]),
		)
		.forEach(attachSystemToEntity);
}

export const grocerySystem = new EcsSystem(
	[locationComponent, outlineComponent, surfaceComponent, pathableComponent],
	attachSystem,
);
