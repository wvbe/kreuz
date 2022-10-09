import { Generator } from './mod.ts';
import { PersonEntity } from './src/entities/PersonEntity.ts';
import { HeadlessController } from './src/rendering/HeadlessController.ts';

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
	entity.$startedWalking.on(() => `@${entity.label} started walking.`);
	entity.$stoppedWalking.on(() => `@${entity.label} stopped walking.`);
	entity.$stoppedWalkStep.on(() => `@${entity.label} took a step.`);
});

persons.forEach((person) => console.log(`@${person.label} is on job: ${person.job?.label}`));

const controller = new HeadlessController();
controller.attachToGame(game);
controller.startAnimationLoop();
