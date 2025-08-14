import { DAY } from '../../time/constants';
import { byEcsComponents } from '../assert';
import { EcsSystem } from '../classes/EcsSystem';
import { eventLogComponent } from '../components/eventLogComponent';
import { healthComponent } from '../components/healthComponent';
import { getTileAtLocation } from '../components/location/getTileAtLocation';
import { isMapLocationEqualTo } from '../components/location/isMapLocationEqualTo';
import { locationComponent } from '../components/locationComponent';

export const surfaceCollapseSystem = new EcsSystem(async (game) => {
	game.entities.$add.on(async (entities) => {
		await Promise.all(
			entities
				.filter(byEcsComponents([locationComponent, healthComponent], [eventLogComponent]))
				.map(async (person) => {
					let destrLast: null | (() => void) = null;
					person.location.on(() => {
						destrLast?.();

						const penalizeHealth = () => {
							console.log('Collapse detected');
							person.events?.add('Entity got buried.');
							// const orig = person.health.delta;
							person.health.setDelta(-1 / (0.5 * DAY));
							person.location.once(() => {
								person.health.setDelta(0);
							});
						};
						const tile = getTileAtLocation(person.location.get());
						if (!tile.surfaceType.get()?.walkability) {
							penalizeHealth();
						}
						destrLast = tile.surfaceType.on((surfaceType) => {
							const same = isMapLocationEqualTo(
								tile.location.get(),
								person.location.get(),
							);
							if (same && !surfaceType?.walkability) {
								penalizeHealth();
							} else {
								person.health.setDelta(0);
							}
						});
					});
				}),
		);
	});
});
