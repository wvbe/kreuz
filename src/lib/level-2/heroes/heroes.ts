import { personArchetype } from '../../level-1/ecs/archetypes/personArchetype';

export const headOfState = personArchetype.create({
	location: [0, 0, Infinity],
	name: 'Richard I',
	icon: '🤴',
	behavior: null,
});
