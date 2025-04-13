import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePath } from '../routes/ROUTES';

/**
 * A hook that returns a function to navigate to a route path. This hook can be used like so:
 *
 *     const navigate = useNavigation();
 *     navigate(ROUTE_ENTITY_DETAILS, { entityId: entity.id });
 */
export function useNavigation() {
	const navigateOriginal = useNavigate();
	const navigate = useCallback((pathName: string, properties: Record<string, string> = {}) => {
		return navigateOriginal(generatePath(pathName, properties));
	}, []);
	return navigate;
}
