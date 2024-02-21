import { EntityI, EventedValue, FilterFn } from '@lib';
import { useCallback } from 'react';
import { useEventedValue } from './useEventedValue.ts';

// Fuck react context, takes too long, fix later.

export const SELECTED_ENTITY = new EventedValue<EntityI | null>(null, 'The selected entity');
/**
 * @TODO Duplicate
 * @deprecated Duplicate
 */
export async function setSelectedEntity(entity: EntityI | null): Promise<void> {
	await SELECTED_ENTITY.set(entity);
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
