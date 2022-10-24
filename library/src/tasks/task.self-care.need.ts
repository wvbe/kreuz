import { type Game } from '../../mod.ts';
import { PersonNeedId, PERSON_NEEDS } from '../constants/needs.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import { EntityI } from '../entities/types.ts';
import { Task } from './task.ts';
import { waitWhileReceivingNeed, walkAvatarToNearestEntity } from './util/functions.ts';

export class SelfcareNeedTask extends Task<[Game, PersonEntity]> {
	public constructor(options: { needId: PersonNeedId; entityFilter: (e: EntityI) => boolean }) {
		super(async (game, entity) => {
			console.log('Go do it');
			await walkAvatarToNearestEntity(game, entity, options.entityFilter);
			await waitWhileReceivingNeed(entity, entity.needs[options.needId]);
		});
	}
}
