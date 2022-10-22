import { MaterialI } from '@lib';
import { FunctionComponent } from 'react';
import { PopOnUpdateSpan } from './atoms/PopOnUpdateSpan.tsx';

export const InventoryStack: FunctionComponent<{
	material: MaterialI | null;
	quantity: number;
	isGhost?: boolean;
}> = ({ material, quantity, isGhost }) => (
	<div
		className={`inventory-stack ${isGhost ? 'inventory-stack--ghost' : ''}`}
		title={material ? `${quantity} x ${material.label}` : 'Empty slot!'}
	>
		<div className="inventory-stack__symbol">{material?.symbol || '❓'}</div>
		<div className="inventory-stack__quantity">
			<PopOnUpdateSpan
				text={quantity === Infinity ? '∞' : quantity === -Infinity ? '-' : String(quantity)}
			/>
		</div>
	</div>
);
