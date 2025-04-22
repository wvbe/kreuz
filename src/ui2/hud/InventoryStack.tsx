import React, { FunctionComponent } from 'react';
import { PopOnUpdateSpan } from '../util/PopOnUpdateSpan';

import './InventoryStack.css';

export const InventoryStack: FunctionComponent<{
	icon: string | null;
	label: string | null;
	quantity: number;
	isGhost?: boolean;
}> = ({ icon, label, quantity, isGhost }) => {
	return (
		<div
			className={`inventory-stack ${isGhost ? 'inventory-stack--ghost' : ''}`}
			title={quantity > 0 ? `${quantity} x ${label}` : 'Empty slot!'}
		>
			<div className='inventory-stack__symbol'>{icon || '❓'}</div>
			<div className='inventory-stack__quantity'>
				<PopOnUpdateSpan>
					{quantity === Infinity ? '∞' : quantity === -Infinity ? '-' : String(quantity)}
				</PopOnUpdateSpan>
			</div>
		</div>
	);
};
