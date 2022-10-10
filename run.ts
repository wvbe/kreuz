/**
 * The expected outcome is a game that keeps on running.
 */

import { Generator, HeadlessController, PersonEntity } from './mod.ts';

const game = Generator.randomGame(1, { density: 1, size: 20 });

game.$$focus.on(() => console.log('Game focus changes'));

game.entities.forEach((entity) => {
	entity.$$location.on(() => console.log(`Entity "${entity.label}" changed location`));
});

const persons = game.entities.filter(
	(entity): entity is PersonEntity => entity instanceof PersonEntity,
);
console.log(`-- ${persons.length} persons`);
persons.forEach((entity) => {
	entity.$stepStart.on(() => console.log(`@${entity.label} started walking.`));
	entity.$pathEnd.on(() => console.log(`@${entity.label} stopped walking.`));
	entity.$stepEnd.on(() => console.log(`@${entity.label} took a step.`));
});

persons.forEach((person) => console.log(`@${person.label} is on job: ${person.job?.label}`));

const controller = new HeadlessController({ delayBetweenJumps: 0 });
controller.attachToGame(game);
controller.startAnimationLoop();
