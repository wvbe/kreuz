import { Meta, Story } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { Coordinate } from '../src/classes/Coordinate';
import { BuildingEntity } from '../src/entities/BuildingEntity';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { SettlementEntity } from '../src/entities/SettlementEntity';
import { TreeEntity } from '../src/entities/TreeEntity';
import { RendererDetail } from '../src/rendering/RendererDetail';
import { ThreeController } from '../src/rendering/threejs/ThreeController';
import { Tile } from '../src/terrain/Tile';
import { Backdrop } from './util';

const meta: Meta = {
	title: 'Entities',
	argTypes: {
		children: {
			control: {
				type: 'text'
			}
		}
	},
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

const CAMERA_POSITION = new Coordinate(-1, 1, 1);
const CAMERA_FOCUS = new Coordinate(0, 0, 0.25);

function makeStory(
	label: string,
	maker: (controller: ThreeController, seed: string) => () => void
) {
	const MadeStory: Story = () => {
		const [seed, setSeed] = useState('test');
		const build = useCallback(controller => maker(controller, seed), [seed]);

		return (
			<Backdrop height={'100vh'} padding={0}>
				<RendererDetail build={build} />
				<div style={{ position: 'absolute', top: '1em', left: '1em' }}>
					<button
						onClick={() => {
							const newSeed = String(Date.now());
							console.log(`Setting new seed to ${newSeed}`);
							setSeed(newSeed);
						}}
					>
						Random seed
					</button>
				</div>
			</Backdrop>
		);
	};
	MadeStory.storyName = label;

	return MadeStory;
}

export const guardentity = makeStory('GuardEntity', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(new GuardEntity(seed, new Tile(0, 0, 0)).createObject());
	return () => {};
});

export const civilianentity = makeStory('CivilianEntity', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(new CivilianEntity(seed, new Tile(0, 0, 0)).createObject());
	return () => {};
});

export const buildingentity = makeStory('BuildingEntity', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(
		new BuildingEntity(seed, new Tile(0, 0, 0), {
			baseWidth: 0.5,
			baseDepth: 0.6,
			baseHeight: 0.4,
			roofHeight: 0.2
		}).createObject()
	);
	return () => {};
});

export const settlemententity = makeStory('SettlementEntity', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(
		new SettlementEntity(seed, new Tile(0, 0, 0), {
			areaSize: 1,
			minimumBuildingLength: 0.3,
			scale: 1
		}).createObject()
	);
	return () => {};
});

export const treeentity = makeStory('TreeEntity', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(new TreeEntity(seed, new Tile(0, 0, 0)).createObject());
	return () => {};
});
