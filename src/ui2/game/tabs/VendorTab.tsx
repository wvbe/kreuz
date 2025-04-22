import React from 'react';
import { vendorComponent } from '../../../lib/level-1/ecs/components/vendorComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';

/**
 * A React component that displays information about the vendor component of an entity.
 *
 * @param entity - The entity with a vendor component.
 *
 * @returns A JSX element displaying the vendor component details.
 *
 * @see {@link vendorComponent}
 */
const VendorTab: React.FC<{ entity: EcsEntity<typeof vendorComponent> }> = ({ entity }) => {
	return (
		<div>
			<h3>Vendor Information</h3>
			<p>Profit Margin: {entity.profitMargin}</p>
			<ul>
				{entity.sellMaterialsWhenAbove.map((material, index) => (
					<li key={index}>{material.material.toString()}</li>
				))}
			</ul>
		</div>
	);
};

export default VendorTab;
