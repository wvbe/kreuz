import { EventedValue, Inventory, MaterialState } from '@lib';
import React, { FunctionComponent, useCallback } from 'react';
import { InventoryStack } from './InventoryStack.tsx';
import { useEventData, useEventedValue } from '../hooks/useEventedValue.ts';

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

export const MoneyBag: FunctionComponent<{ wallet: EventedValue<number> }> = ({ wallet }) => {
	const money = useEventedValue(wallet);
	return <p>💰 {money.toFixed(2)}</p>;
};

export const InventoryUI: FunctionComponent<{
	wallet?: EventedValue<number>;
	inventory: Inventory;
}> = ({ wallet, inventory }) => {
	const stacks = useEventData(
		inventory.$change,
		inventory.getStacks(),
		useCallback(() => inventory.getStacks(), [inventory]),
	);

	return (
		<>
			{wallet && <MoneyBag wallet={wallet} />}
			{stacks.length || (inventory.capacity && inventory.capacity !== Infinity) ? (
				<InventoryBag stacks={stacks} capacity={inventory.capacity} />
			) : null}
		</>
	);
};
