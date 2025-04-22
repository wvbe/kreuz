import React from 'react';
import { surfaceComponent } from '../../../lib/level-1/ecs/components/surfaceComponent';
import { EcsEntity } from '../../../lib/level-1/ecs/types';

/**
 * A React component that displays information about the surface component of an entity.
 *
 * @param entity - The entity with a surface component.
 *
 * @returns A JSX element displaying the surface component details.
 *
 * @see {@link surfaceComponent}
 */
const SurfaceTab: React.FC<{ entity: EcsEntity<typeof surfaceComponent> }> = ({ entity }) => {
	return (
		<div>
			<h3>Surface Information</h3>
			{/* Add specific details about the surface component here */}
		</div>
	);
};

export default SurfaceTab;
