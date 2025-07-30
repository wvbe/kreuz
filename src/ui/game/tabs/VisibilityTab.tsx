import React from 'react';
import { visibilityComponent } from '../../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../../game/core/ecs/types';

/**
 * A React component that displays information about the visibility component of an entity.
 *
 * @param entity - The entity with a visibility component.
 *
 * @returns A JSX element displaying the visibility component details.
 *
 * @see {@link visibilityComponent}
 */
const VisibilityTab: React.FC<{ entity: EcsEntity<typeof visibilityComponent> }> = ({ entity }) => {
	return (
		<div>
			<h3>Visibility Information</h3>
			{/* Add specific details about the visibility component here */}
		</div>
	);
};

export default VisibilityTab;
