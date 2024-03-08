import { EventedValue, Inventory, MaterialState } from '@lib';
import React, { FunctionComponent, useCallback } from 'react';
import { InventoryStack } from './InventoryStack.tsx';
import { useEventData, useEventedValue } from '../hooks/useEventedValue.ts';
import { PopOnUpdateSpan } from '../components/atoms/PopOnUpdateSpan.tsx';

export const InventoryBag: FunctionComponent<{ stacks: MaterialState[]; capacity?: number }> = ({
	stacks,
	capacity,
}) => (
	<div className="inventory">
		<p style={{ margin: 0 }}>
			<MoneyBag
				value={stacks.reduce((total, stack) => total + stack.material.value * stack.quantity, 0)}
			/>{' '}
			item value
		</p>
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

export const MoneyBag: FunctionComponent<{ wallet?: EventedValue<number>; value?: number }> = ({
	wallet,
	value,
}) => {
	if (wallet) {
		return <MoneyBagWallet wallet={wallet} />;
	} else {
		return <MoneyBagInner value={value} />;
	}
};
export const MoneyBagWallet: FunctionComponent<{
	wallet: EventedValue<number>;
}> = ({ wallet }) => {
	const value = useEventedValue(wallet);
	return <MoneyBagInner value={value} />;
};
export const MoneyBagInner: FunctionComponent<{
	value?: number;
}> = ({ value }) => {
	return (
		<PopOnUpdateSpan>💰 {value === undefined ? '-' : (value || 0).toFixed(2)}</PopOnUpdateSpan>
	);
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
			{wallet && (
				<p>
					<MoneyBag wallet={wallet} /> cash
				</p>
			)}
			{stacks.length || (inventory.capacity && inventory.capacity !== Infinity) ? (
				<InventoryBag stacks={stacks} capacity={inventory.capacity} />
			) : null}
		</>
	);
};
