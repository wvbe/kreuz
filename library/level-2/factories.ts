import { FactoryBuildingEntityOptions } from '../level-1/mod.ts';
import * as blueprints from './blueprints.ts';

export const WHEAT_FARM: FactoryBuildingEntityOptions = {
	blueprint: blueprints.growWheat,
	maxWorkers: 2,
	maxStackSpace: 20,
};

export const WHEAT_MILL: FactoryBuildingEntityOptions = {
	blueprint: blueprints.milling,
	maxWorkers: 1,
	maxStackSpace: 20,
};

export const BAKERY: FactoryBuildingEntityOptions = {
	blueprint: blueprints.breadBaking,
	maxWorkers: 3,
	maxStackSpace: 6,
};

export const IRON_MINE: FactoryBuildingEntityOptions = {
	blueprint: blueprints.ironOreMining,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const COPPER_MINE: FactoryBuildingEntityOptions = {
	blueprint: blueprints.copperOreMining,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const TIN_MINE: FactoryBuildingEntityOptions = {
	blueprint: blueprints.tinOreMining,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const IRON_FOUNDRY: FactoryBuildingEntityOptions = {
	blueprint: blueprints.ironOreMining,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const COPPER_FOUNDRY: FactoryBuildingEntityOptions = {
	blueprint: blueprints.copperIngotProduction,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const TIN_FOUNDRY: FactoryBuildingEntityOptions = {
	blueprint: blueprints.tinIngotProduction,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const BRONZE_FOUNDRY: FactoryBuildingEntityOptions = {
	blueprint: blueprints.bronzeIngotProduction,
	maxWorkers: 4,
	maxStackSpace: 6,
};

export const APIARY: FactoryBuildingEntityOptions = {
	blueprint: blueprints.beeKeeping,
	maxWorkers: 1,
	maxStackSpace: 6,
};

export const CHICKEN_COOP: FactoryBuildingEntityOptions = {
	blueprint: blueprints.chickenCoop,
	maxWorkers: 0,
	maxStackSpace: 6,
};
