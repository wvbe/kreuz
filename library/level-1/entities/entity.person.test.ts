/**
 * @TODO Decouple from level 2 and 3 APIs
 */

import { describe, expect, it, run } from 'tincan';
import { PersonEntity } from './entity.person.ts';

import { DEFAULT_ASSETS } from '@lib/assets';
import { createConsumeBehavior } from '../../level-2/behavior/reusable/nodes/createConsumeBehavior.ts';

const hydrateSelfBehavior = DEFAULT_ASSETS.behaviorNodes.item('bt-17');

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
		await entity.$behavior.set(hydrateSelfBehavior);
		expect(entity.toSaveJson(DEFAULT_ASSETS).behavior).toEqual({
			current: 'bt-17',
			label: 'PersonEntity $behavior',
		});
	});
	it(`round-trip`, async () => {
		async function makeEntity() {
			const entity = new PersonEntity('guy', [0, 0, Infinity], {
				firstName: 'Dude',
				gender: 'm',
				needs: {},
			});
			await entity.$behavior.set(hydrateSelfBehavior);
			return entity;
		}

		expect(
			await PersonEntity.fromSaveJson(
				DEFAULT_ASSETS,
				(await makeEntity()).toSaveJson(DEFAULT_ASSETS),
			),
		).toEqual(await makeEntity());
	});
});

run();
