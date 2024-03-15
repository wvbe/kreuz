export const ROUTE_LANDING_PAGE = '/';
export const ROUTE_ENTITIES_PEOPLE = '/people/*';
export const ROUTE_ENTITIES_DETAILS = '/entity/:entityId/*';
export const ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS = '/people/:entityId/jobs';
export const ROUTE_ENTITIES_FACTORIES = '/factories/*';
export const ROUTE_ENTITIES_MARKETS = '/market-places/*';
export const ROUTE_PRODUCTION = '/production/*';
export const ROUTE_MATERIALS = '/materials/*';
export const ROUTE_MATERIALS_DETAILS = '/materials/:materialId';
export const ROUTE_PRODUCTION_DETAILS = '/production/:blueprintId';

export { generatePath } from 'react-router-dom';
