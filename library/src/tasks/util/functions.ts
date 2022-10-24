import { EventedPromise } from '../../classes/EventedPromise.ts';
import { Path } from '../../classes/Path.ts';
import { PersonEntity } from '../../entities/entity.person.ts';
import { Need } from '../../entities/Need.ts';
import { EntityI } from '../../entities/types.ts';
import Game from '../../Game.ts';
import { TileI } from '../../types.ts';

enum Cancel {
	NO_SUPPLIER,
	INTERRUPTED,
}

export async function walkAvatarToNearestEntity<P extends EntityI>(
	game: Game,
	entity: PersonEntity,
	filter: (tile: EntityI) => boolean,
): Promise<void> {
	const { x, y } = entity.$$location.get();
	const start = game.terrain.getTileEqualToXy(x, y);
	if (!start) {
		// Programmer error somewhere
		throw new Error('Bzzt');
	}
	const candidates = game.entities
		.filter<P>(filter)
		.map((entity) => {
			const { x, y } = entity.$$location.get();
			return game.terrain.getTileEqualToXy(x, y);
		})
		.filter((tile): tile is TileI => {
			if (!tile) {
				// Programmer error somewhere
				throw new Error('Bzzt');
			}
			return true;
		});
	if (candidates.includes(start)) {
		return Promise.resolve();
	}

	if (!candidates.length) {
		// REJECT?
		return;
	}
	// Find the nearest reachable church
	const shortest = new Path(game.terrain, { closest: false }).findPathToClosest(start, candidates);
	if (!shortest) {
		// REJECT?
		return;
	}

	// Walk there
	await entity.walkAlongPath(shortest.path);
}

export async function waitWhileReceivingNeed(entity: PersonEntity, need: Need): Promise<void> {
	const { $finish, $interrupt, promise } = new EventedPromise();
	const stopListeningForJobChange = entity.$$job.once(() => {
		$interrupt.emit(Cancel.INTERRUPTED);
	});
	$finish.once(stopListeningForJobChange);
	$interrupt.once(stopListeningForJobChange);
	const oldDelta = need.delta;
	$interrupt.once(
		need.onceBetween(1, Infinity, () => {
			need.setDelta(oldDelta);
			$finish.emit();
		}),
	);
	need.setDelta(1 / 5000);

	await promise;
}
