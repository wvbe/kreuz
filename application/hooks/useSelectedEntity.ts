import { EntityI, EventedValue, FilterFn } from '@lib';
import { useCallback } from 'react';
import { useEventedValue } from '@ui';

// Fuck react context, takes too long, fix later.

export const SELECTED_ENTITY = new EventedValue<EntityI | null>(null, 'The selected entity');

export function setSelectedEntity(entity: EntityI | null): void {
	SELECTED_ENTITY.set(entity);
}

export function useSelectedEntity(): EntityI | null {
	return useEventedValue(SELECTED_ENTITY);
}

export function useIsSelectedEntity(compare: EntityI): boolean {
	return useEventedValue(
		SELECTED_ENTITY,
		useCallback<FilterFn<EntityI | null>>((selected) => selected === compare, [compare]),
	);
}
