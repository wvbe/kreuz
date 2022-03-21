import { Meta, Story } from '@storybook/react';
import React, { useCallback } from 'react';
import { Coordinate } from '../src/classes/Coordinate';
import { BuildingEntity } from '../src/entities/BuildingEntity';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { SettlementEntity } from '../src/entities/SettlementEntity';
import { ForestEntity } from '../src/entities/ForestEntity';
import { RendererDetail } from '../src/rendering/RendererDetail';
import { ThreeController } from '../src/rendering/threejs/ThreeController';
import { Tile } from '../src/terrain/Tile';
import { Backdrop } from './util';

type Controls = {
	seed: string;
};
const meta: Meta = {
	title: 'Entities',
	args: { seed: 'test' },
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

const CAMERA_POSITION = new Coordinate(-1, 1, 1);
const CAMERA_FOCUS = new Coordinate(0, 0, 0.25);

function makeStory<P>(
	label: string,
	maker: (controller: ThreeController, args: P) => () => void,
	defaultArgs: P
) {
	const MadeStory: Story<P> = props => {
		const build = useCallback(controller => maker(controller, props), [props]);

		return (
			<Backdrop height={'100vh'} padding={0}>
				<RendererDetail build={build} />
			</Backdrop>
		);
	};
	MadeStory.storyName = label;
	MadeStory.args = defaultArgs;

	return MadeStory;
}

export const guardentity = makeStory<Controls>(
	'GuardEntity',
	(controller, args) => {
		controller.setCameraPosition(CAMERA_POSITION);
		controller.setCameraFocus(CAMERA_FOCUS);
		controller.addAxisHelper(undefined, 1);
		controller.scene.add(new GuardEntity(args.seed, new Tile(0, 0, 0)).createObject());
		return () => {};
	},
	{ seed: 'test' }
);

export const civilianentity = makeStory<Controls>(
	'CivilianEntity',
	(controller, args) => {
		controller.setCameraPosition(CAMERA_POSITION);
		controller.setCameraFocus(CAMERA_FOCUS);
		controller.addAxisHelper(undefined, 1);
		controller.scene.add(new CivilianEntity(args.seed, new Tile(0, 0, 0)).createObject());
		return () => {};
	},
	{ seed: 'test' }
);

export const buildingentity = makeStory<
	Controls & {
		baseWidth: number;
		baseDepth: number;
		baseHeight: number;
		roofHeight: number;
	}
>(
	'BuildingEntity',
	(controller, args) => {
		const { seed, ...params } = args;
		controller.setCameraPosition(CAMERA_POSITION);
		controller.setCameraFocus(CAMERA_FOCUS);
		controller.addAxisHelper(undefined, 1);
		controller.scene.add(new BuildingEntity(seed, new Tile(0, 0, 0), params).createObject());
		return () => {};
	},
	{ seed: 'test', baseWidth: 0.5, baseDepth: 0.6, baseHeight: 0.4, roofHeight: 0.2 }
);

export const settlemententity = makeStory<
	Controls & { areaSize: number; minimumBuildingLength: number; scale: number }
>(
	'SettlementEntity',
	(controller, args) => {
		const { seed, ...params } = args;
		controller.setCameraPosition(CAMERA_POSITION);
		controller.setCameraFocus(CAMERA_FOCUS);
		controller.addAxisHelper(undefined, 1);
		controller.scene.add(new SettlementEntity(seed, new Tile(0, 0, 0), params).createObject());
		return () => {};
	},
	{ seed: 'test', areaSize: 1, minimumBuildingLength: 0.3, scale: 1 }
);

export const treeentity = makeStory(
	'ForestEntity',
	(controller, args) => {
		controller.setCameraPosition(CAMERA_POSITION);
		controller.setCameraFocus(CAMERA_FOCUS);
		controller.addAxisHelper(undefined, 1);
		controller.scene.add(new ForestEntity(args.seed, new Tile(0, 0, 0)).createObject());
		return () => {};
	},
	{ seed: 'test' }
);
