export const ROUTE_LANDING_PAGE = '/';
export const ROUTE_ENTITIES_PEOPLE = '/entities/*';
export const ROUTE_ENTITIES_DETAILS = '/entities/:entityId/*';
export const ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS = '/entities/:entityId/jobs';
export const ROUTE_ENTITIES_EVENTS_DETAILS = '/entities/:entityId/log';

export const ROUTE_PRODUCTION = '/production/*';
export const ROUTE_MATERIALS = '/materials/*';
export const ROUTE_MATERIALS_DETAILS = '/materials/:materialId';
export const ROUTE_PRODUCTION_DETAILS = '/production/:blueprintId';

export { generatePath } from 'react-router-dom';
