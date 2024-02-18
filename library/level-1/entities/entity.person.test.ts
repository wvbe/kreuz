/**
 * @TODO Decouple from level 2 and 3 APIs
 */

import { describe, expect, it, run } from 'tincan';
import { PersonEntity } from './entity.person.ts';

import { hydrateSelfBehavior } from '../../level-2/behavior/hydrateSelfBehavior.ts';
import { DEFAULT_ASSETS } from '../../level-2/mod.ts';
describe('PersonEntity', () => {
	it(`save without behavior`, async () => {
		const entity = new PersonEntity('guy', [0, 0, Infinity], {
			firstName: 'Dude',
			gender: 'm',
			needs: {},
		});
		expect(entity.toSaveJson(DEFAULT_ASSETS).behavior).toEqual({
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
		expect(entity.toSaveJson(DEFAULT_ASSETS).behavior).toEqual({
			current: 'bt-17',
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

		expect(
			PersonEntity.fromSaveJson(DEFAULT_ASSETS, makeEntity().toSaveJson(DEFAULT_ASSETS)),
		).toEqual(makeEntity());
	});
});

run();
