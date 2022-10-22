import { EntityI, EventedValue } from '@lib';
import { useEventedValue } from './useEventedValue.ts';

// Fuck react context, takes too long, fix later.

export const SELECTED_ENTITY = new EventedValue<EntityI | null>(null, 'The selected entity');

export function setSelectedEntity(entity: EntityI | null): void {
	SELECTED_ENTITY.set(entity);
}

export function useSelectedEntity(): EntityI | null {
	return useEventedValue(SELECTED_ENTITY);
}
