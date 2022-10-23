import { FunctionComponent, useCallback } from 'react';
import { Inventory, MaterialState } from '@lib';
import { useEvent } from '../hooks/useEventedValue.ts';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';
import { InventoryStack } from './InventoryStack.tsx';

export const InventoryBag: FunctionComponent<{ stacks: MaterialState[]; capacity?: number }> = ({
	stacks,
	capacity,
}) => (
	<div className="inventory">
		{stacks.map((state, index) => (
			<InventoryStack key={index} {...state} />
		))}
		{capacity && capacity !== Infinity && stacks.length < capacity
			? Array.from(new Array(capacity - stacks.length)).map((_, i) => (
					<InventoryStack key={`ghost-${i}`} material={null} quantity={-Infinity} isGhost />
			  ))
			: null}
	</div>
);

export const InventoryUI: FunctionComponent<{ inventory: Inventory }> = ({ inventory }) => {
	const stacks = useEvent(
		inventory.$change,
		[],
		useCallback(() => inventory.getStacks(), [inventory]),
	);

	return stacks.length || (inventory.capacity && inventory.capacity !== Infinity) ? (
		<InventoryBag stacks={stacks} capacity={inventory.capacity} />
	) : null;
};
