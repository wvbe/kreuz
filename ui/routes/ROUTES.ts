export const ROUTE_LANDING_PAGE = '/';
export const ROUTE_ENTITIES_PEOPLE = '/people/*';
export const ROUTE_ENTITIES_PEOPLE_DETAILS = '/people/:entityId/*';
export const ROUTE_ENTITIES_PEOPLE_TRADE_DETAILS = '/people/:entityId/trade';
export const ROUTE_ENTITIES_PEOPLE_JOBS_DETAILS = '/people/:entityId/jobs';
export const ROUTE_ENTITIES_FACTORIES = '/factories/*';
export const ROUTE_ENTITIES_FACTORIES_DETAILS = '/factories/:entityId';
export const ROUTE_ENTITIES_MARKETS = '/market-places/*';
export const ROUTE_ENTITIES_MARKETS_DETAILS = '/market-places/:entityId';
export const ROUTE_PRODUCTION = '/production';
export const ROUTE_MATERIALS = '/materials';
export const ROUTE_BLUEPRINTS = '/blueprints';

export { generatePath } from 'react-router-dom';
