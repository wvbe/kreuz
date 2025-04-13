import React, { FunctionComponent, useCallback } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { ROUTE_MATERIALS_DETAILS } from '../routes/ROUTES';
import { Material } from 'src/lib/level-1/inventory/Material';
import { PopOnUpdateSpan } from '../components/atoms/PopOnUpdateSpan';
import { useGameContext } from '../context/GameContext';

export const InventoryStack: FunctionComponent<{
	material: Material | null;
	quantity: number;
	isGhost?: boolean;
}> = ({ material, quantity, isGhost }) => {
	const navigate = useNavigation();
	const game = useGameContext();
	const onClick = useCallback<React.MouseEventHandler<HTMLDivElement>>(
		(event) => {
			if (!material) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			navigate(ROUTE_MATERIALS_DETAILS, {
				materialId: game.assets.materials.key(material),
			});
		},
		[material, game],
	);
	return (
		<div
			className={`inventory-stack ${isGhost ? 'inventory-stack--ghost' : ''}`}
			title={material ? `${quantity} x ${material.label}` : 'Empty slot!'}
			onClick={onClick}
		>
			<div className='inventory-stack__symbol'>{material?.symbol || '❓'}</div>
			<div className='inventory-stack__quantity'>
				<PopOnUpdateSpan>
					{quantity === Infinity ? '∞' : quantity === -Infinity ? '-' : String(quantity)}
				</PopOnUpdateSpan>
			</div>
		</div>
	);
};
