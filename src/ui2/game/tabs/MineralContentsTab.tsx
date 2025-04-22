import React from 'react';
import { mineralContentsComponent } from '../../../lib/level-1/ecs/components/mineralContentsComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';

/**
 * A React component that displays information about the mineral contents component of an entity.
 *
 * @param entity - The entity with a mineral contents component.
 *
 * @returns A JSX element displaying the mineral contents component details.
 *
 * @see {@link mineralContentsComponent}
 */
const MineralContentsTab: React.FC<{ entity: EcsEntity<typeof mineralContentsComponent> }> = ({
	entity,
}) => {
	return (
		<div>
			<h3>Mineral Contents Information</h3>
			{/* Add specific details about the mineral contents component here */}
		</div>
	);
};

export default MineralContentsTab;
