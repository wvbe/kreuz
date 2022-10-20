import { FunctionComponent, useCallback } from 'react';
import { Inventory } from '@lib';
import { useEvent } from '../hooks/useEventedValue.ts';
import { MaterialState } from '../library/src/inventory/types.ts';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';

export const InventoryBag: FunctionComponent<{ stacks: MaterialState[] }> = ({ stacks }) => (
	<div className="inventory">
		{stacks.map(({ material, quantity }, index) => (
			<div className="inventory-stack" key={index} title={`${quantity} x ${material.label}`}>
				<div className="inventory-stack__symbol">{material.symbol}</div>
				<div className="inventory-stack__quantity">
					<PopOnUpdateSpan text={String(quantity)} />
				</div>
			</div>
		))}
	</div>
);

export const InventoryUI: FunctionComponent<{ inventory: Inventory }> = ({ inventory }) => {
	const stacks = useEvent(
		inventory.$change,
		[],
		useCallback(() => inventory.getStacks(), [inventory]),
	);

	return stacks.length ? <InventoryBag stacks={stacks} /> : null;
};
