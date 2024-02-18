/**
 * @TODO Decouple from level 2 and 3 APIs
 */

import { describe, expect, it, run } from 'tincan';
import { TestDriver } from '../drivers/TestDriver.ts';
import Game from '../Game.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { Material } from '../inventory/Material.ts';
import { type DriverI } from '../mod.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { FactoryBuildingEntity } from './entity.building.factory.ts';
import { PersonEntity } from './entity.person.ts';
import { headOfState } from '../../level-2/heroes.ts';

import { hydrateSelfBehavior } from '../../level-2/behavior/hydrateSelfBehavior.ts';
describe('PersonEntity', () => {
	it(`save without behavior`, async () => {
		const entity = new PersonEntity('guy', [0, 0, Infinity], {
			firstName: 'Dude',
			gender: 'm',
			needs: {},
		});
		expect(entity.toSaveJson().behavior).toEqual({
			current: null,
			label: 'PersonEntity $behavior',
		});
	});
	it(`save with behavior`, async () => {
		const entity = new PersonEntity('guy', [0, 0, Infinity], {
			firstName: 'Dude',
			gender: 'm',
			needs: {},
		});
		entity.$behavior.set(hydrateSelfBehavior);
		expect(entity.toSaveJson().behavior).toEqual({
			current: 'node-17',
			label: 'PersonEntity $behavior',
		});
	});
	it(`round-trip`, async () => {
		function makeEntity() {
			const entity = new PersonEntity('guy', [0, 0, Infinity], {
				firstName: 'Dude',
				gender: 'm',
				needs: {},
			});
			entity.$behavior.set(hydrateSelfBehavior);
			return entity;
		}

		expect(PersonEntity.fromSaveJson(makeEntity().toSaveJson())).toEqual(makeEntity());
	});
});

run();
