import { FunctionComponent } from 'react';
import { PopOnUpdateSpan } from '../util/PopOnUpdateSpan';

import styles from './InventoryStack.module.css';

export const InventoryStack: FunctionComponent<{
	icon: string | null;
	label: string | null;
	quantity: number;
	isGhost?: boolean;
}> = ({ icon, label, quantity, isGhost }) => {
	return (
		<div
			className={`${styles['inventory-stack']} ${
				isGhost ? styles['inventory-stack--ghost'] : ''
			}`}
			title={quantity > 0 ? `${quantity} x ${label}` : 'Empty slot!'}
		>
			<div className={styles['inventory-stack__symbol']}>{icon || '❓'}</div>
			<div className={styles['inventory-stack__quantity']}>
				<PopOnUpdateSpan>
					{quantity === Infinity ? '∞' : quantity === -Infinity ? '-' : String(quantity)}
				</PopOnUpdateSpan>
			</div>
		</div>
	);
};
