import React, { FunctionComponent, useCallback } from 'react';
import { Inventory } from '../../lib/level-1/ecs/components/inventoryComponent/Inventory';
import { EventedValue } from '../../lib/level-1/events/EventedValue';
import { MaterialState } from '../../lib/level-1/inventory/types.js';
import { useEventedValue, useMemoFromEvent } from '../../ui/hooks/useEventedValue';
import { InventoryStack } from '../hud/InventoryStack';
import { PopOnUpdateSpan } from '../util/PopOnUpdateSpan';

export const InventoryBag: FunctionComponent<{
	stacks: MaterialState[];
	capacity?: number;
}> = ({ stacks, capacity }) => (
	<div>
		<p style={{ margin: 0 }}>
			<MoneyBag
				value={stacks.reduce(
					(total, stack) => total + stack.material.value * stack.quantity,
					0,
				)}
			/>{' '}
			item value
		</p>
		{stacks.map((state, index) => (
			<InventoryStack
				key={index}
				icon={state.material.symbol}
				label={state.material.label}
				quantity={state.quantity}
			/>
		))}
		{capacity && capacity !== Infinity && stacks.length < capacity
			? Array.from(new Array(capacity - stacks.length)).map((_, i) => (
					<InventoryStack
						key={`ghost-${i}`}
						icon={null}
						label={null}
						quantity={-Infinity}
						isGhost
					/>
			  ))
			: null}
	</div>
);

export const MoneyBag: FunctionComponent<{
	wallet?: EventedValue<number>;
	value?: number;
}> = ({ wallet, value }) => {
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

export const GameInventory: FunctionComponent<{
	wallet?: EventedValue<number>;
	inventory: Inventory;
}> = ({ wallet, inventory }) => {
	const transform = useCallback(() => inventory.getStacks(), [inventory]);
	const stacks = useMemoFromEvent(inventory.$change, transform(), transform);

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
