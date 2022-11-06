import { HeroPersonEntity } from '../entities/entity.person.hero.ts';

export const headOfState = new HeroPersonEntity('King', '$$$ king', { x: 0, y: 0, z: Infinity });
(self as any).king = headOfState;
