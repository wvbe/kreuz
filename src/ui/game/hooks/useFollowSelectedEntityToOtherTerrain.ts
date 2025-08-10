import { useEffect } from 'react';
import { hasEcsComponents } from '../../../game/core/ecs/assert';
import { pathingComponent } from '../../../game/core/ecs/components/pathingComponent';
import { useSelectedEntityStore } from '../../stores/selectedEntityStore';
import { setSelectedTerrain } from '../../stores/selectedTerrainStore';

export function useFollowSelectedEntityToOtherTerrain() {
	const selectedEntity = useSelectedEntityStore((state) => state.selectedEntity);

	// Whenever the selected entity walks into another terrain, camera follows to the same terrain
	useEffect(() => {
		if (!selectedEntity || !hasEcsComponents(selectedEntity, [pathingComponent])) {
			return;
		}
		return selectedEntity.$portalExited.on((portal) => {
			setSelectedTerrain(portal.terrain);
		});
	}, [selectedEntity]);
}
