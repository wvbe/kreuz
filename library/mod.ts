export * from './src/types.ts';

export { default as Game } from './src/Game.ts';

// Entities:
export * from './src/entities/types.ts';
export { Need } from './src/entities/Need.ts';
export { Entity } from './src/entities/entity.ts';
export { PersonEntity } from './src/entities/entity.person.ts';
export { FactoryBuildingEntity } from './src/entities/entity.building.factory.ts';
export { ChurchBuildingEntity } from './src/entities/entity.building.church.ts';
export { MarketBuildingEntity } from './src/entities/entity.building.market.ts';
export { SettlementEntity } from './src/entities/entity.settlement.ts';

// Jobs:
export * from './src/jobs/types.ts';
export { Job } from './src/jobs/Job.ts';
export { PatrolJob } from './src/jobs/PatrolJob.ts';
export { LoiterJob } from './src/jobs/LoiterJob.ts';
export { SelfcareJob } from './src/jobs/SelfcareJob.ts';
export { ProductionJob } from './src/jobs/ProductionJob.ts';

// Drivers:
export * from './src/drivers/types.ts';
export { Driver } from './src/drivers/Driver.ts';
export { TestDriver } from './src/drivers/TestDriver.ts';

// Terrain:
export * from './src/terrain/utils.ts';
export { Terrain } from './src/terrain/Terrain.ts';
export { DualMeshTile } from './src/terrain/DualMeshTile.ts';
export { SquareTile } from './src/terrain/SquareTile.ts';
export { Tile } from './src/terrain/Tile.ts';
export { Path } from './src/classes/Path.ts';
export { Coordinate } from './src/terrain/Coordinate.ts';

// Inventory:
export * from './src/inventory/types.ts';
export { Blueprint } from './src/inventory/Blueprint.ts';
export { Inventory } from './src/inventory/Inventory.ts';
export { Material } from './src/inventory/Material.ts';

// Miscellaneous utilities:
export { Collection } from './src/classes/Collection.ts';
export { Event } from './src/classes/Event.ts';
export { EventedValue } from './src/classes/EventedValue.ts';
export { Random } from './src/classes/Random.ts';
export { TimeLine } from './src/classes/TimeLine.ts';
export { default as Logger } from './src/classes/Logger.ts';

// Constants
export * from './src/constants/needs.ts';
export * as blueprints from './src/constants/blueprints.ts';
export * as materials from './src/constants/materials.ts';
